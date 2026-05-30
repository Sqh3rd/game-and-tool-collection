import type {
  AnyRelationsBuilderConfig,
  ExtractTablesWithRelationsParts,
  Many,
  One,
  Table,
} from "drizzle-orm";
import type { BuildSchema, CoerceOptions } from "drizzle-orm/zod";
import type z from "zod";
import type {
  ExtractInnerObject,
  IntersectKeysOf,
  IsNever,
  MergeUnion,
  Narrow,
  Values,
} from "./helperTypes";

type SchemaGroup<
  Insert extends z._ZodType = z.ZodObject,
  Select extends z._ZodType = z.ZodObject,
  Update extends z._ZodType = z.ZodObject,
> = { insert: Insert; select: Select; update: Update };

type SchemaGroupFromTable<TTable extends Table> = SchemaGroup<
  BuildSchema<"insert", TTable["_"]["columns"], undefined, CoerceOptions>,
  BuildSchema<"select", TTable["_"]["columns"], undefined, CoerceOptions>,
  BuildSchema<"update", TTable["_"]["columns"], undefined, CoerceOptions>
>;

type BaseSchema<T extends Record<string, Table> = Record<string, Table>> = {
  [Key in keyof T]: SchemaGroupFromTable<T[Key]>;
};
type Modifications<T extends BaseSchema> = Partial<{
  [Key in keyof T]: Partial<T[Key]>;
}>;
type ModificationsToAll<T extends BaseSchema> = {
  [Key in keyof Values<T>]: Partial<
    MergeUnion<
      ExtractInnerObject<Values<T>[Key] & z.ZodObject> & object,
      "strict"
    >
  >;
};

type GetTableByRelationName<
  TRelations extends ExtractTablesWithRelationsParts<
    AnyRelationsBuilderConfig,
    Record<string, Table>
  >,
  TRelationsName extends TRelations[keyof TRelations]["name"],
> =
  keyof TRelations extends infer EKey ?
    EKey extends keyof TRelations ?
      IfThenElse<
        Equals<TRelations[EKey]["name"], TRelationsName>,
        TRelations[EKey]["table"]["_"]["name"],
        never
      >
    : never
  : never;
type Relations<
  TRelations extends ExtractTablesWithRelationsParts<
    AnyRelationsBuilderConfig,
    Record<string, Table>
  > = ExtractTablesWithRelationsParts<
    AnyRelationsBuilderConfig,
    Record<string, Table>
  >,
> = {
  [Key in keyof TRelations as TRelations[Key]["table"]["_"]["name"]]: {
    [RKey in keyof TRelations[Key]["relations"]]: TRelations[Key]["relations"][RKey] extends (
      infer ERelation
    ) ?
      ERelation extends One<infer ETarget, infer EOptional> ?
        One<GetTableByRelationName<TRelations, ETarget>, EOptional>
      : ERelation extends Many<infer ETarget> ?
        Many<GetTableByRelationName<TRelations, ETarget>>
      : ERelation
    : never;
  };
};
type ModifiedSchemaWithRelations<
  T extends Record<string, Table>,
  TSchema extends BaseSchema<T>,
  TModifications extends Modifications<TSchema>,
  TRelations extends
    | Relations<ExtractTablesWithRelationsParts<AnyRelationsBuilderConfig, T>>
    | never = never,
> = {
  [Key in keyof T]: IfThenElse<
    Extends<Key, keyof TModifications>,
    Omit<TSchema[Key], keyof TModifications[Key]>
      & Required<TModifications[Key]>
      & Record<"select" | "insert" | "update", object>,
    TSchema[Key]
  >
    & IfThenElse<
      IsNever<TRelations>,
      object,
      { selectWithRelations: () => void }
    >;
};

type _FlattenModifiedSchema<
  T extends Record<string, Table>,
  TSchema extends BaseSchema<T>,
  TModifications extends Modifications<TSchema>,
  TValues extends ModifiedSchemaWithRelations<T, TSchema, TModifications> =
    ModifiedSchemaWithRelations<T, TSchema, TModifications>,
> = {
  [Key in keyof Values<TValues>]: MergeUnion<
    keyof TValues extends infer EKey ?
      EKey extends keyof TValues ?
        TValues[EKey][Key] extends z.ZodObject<infer Inner> ?
          Inner
        : never
      : never
    : never,
    "strict"
  >;
};

type FlattenModifiedSchema<
  T extends Record<string, Table> = Record<string, Table>,
  TSchema extends BaseSchema<T> = BaseSchema<T>,
  TModifications extends Modifications<TSchema> = Modifications<TSchema>,
  TTest extends _FlattenModifiedSchema<T, TSchema, TModifications> =
    _FlattenModifiedSchema<T, TSchema, TModifications>,
> = {
  [Key in keyof TTest]: z.ZodObject<
    TTest[Key] extends z.ZodRawShape ? TTest[Key] : z.ZodRawShape
  >;
};

type SharedPropertiesEqual<A extends object, B extends object> =
  keyof A | keyof B extends infer Key ?
    Key extends keyof A ?
      Key extends keyof B ?
        Equals<A[Key], B[Key]>
      : never
    : never
  : never;
type GuardEqualSharedProperties<
  Actual extends object,
  Reference extends object,
> = {
  [Key in keyof Actual]: Key extends keyof Reference ?
    Equals<Actual[Key], Reference[Key]> extends true ?
      "Unnecessary property: Modified property is same as base property"
    : Actual[Key]
  : Actual[Key];
};
type GuardModification<
  Actual extends object,
  Reference extends object,
> = IfThenElse<
  SharedPropertiesEqual<Actual, Reference>,
  "Unnecessary modification: Modified schemas are the same as the base schemas",
  GuardEqualSharedProperties<Actual, Reference>
>;

type MergeModificationsAndModificationsToAll<
  TModifications extends Modifications<BaseSchema>,
  TModificationsToAll extends ModificationsToAll<BaseSchema>,
> = {
  [Key in keyof TModifications]: TModifications[Key] & TModificationsToAll;
};

type SchemaModifier<
  T extends Record<string, Table>,
  TSchema extends BaseSchema<T>,
  TModifications extends Modifications<TSchema>,
  TRelations extends
    | Relations<ExtractTablesWithRelationsParts<AnyRelationsBuilderConfig, T>>
    | never,
> = {
  /**
   * Create a modified schema
   * @returns
   */
  create: () => ModifiedSchemaWithRelations<
    T,
    TSchema,
    TModifications,
    TRelations
  >;

  /**
   * Applies the given modification to all entries in the schema
   * @returns
   */
  modifyAll: <
    Base extends FlattenModifiedSchema<T, TSchema, TModifications>,
    CModifications extends Partial<Record<string, z.ZodObject>>,
  >(
    factory: (input: Base) => GuardModification<CModifications, Base>,
  ) => SchemaModifier<T, TSchema, TModifications, TRelations>;

  /**
   * Modify a specific entry in the schema
   *
   * @param key
   * @param factory
   * @returns
   */
  modify: <
    Key extends keyof TSchema,
    Base extends (Key extends keyof TModifications ? TModifications[Key]
    : TSchema[Key])
      & object,
    Modification extends Partial<TSchema[Key]>,
  >(
    key: Key,
    factory: (input: Base) => GuardModification<Modification, Base>,
  ) => SchemaModifier<
    T,
    TSchema,
    TModifications & Record<Key, Modification>,
    TRelations
  >;
};

export declare function schemaModifier<T extends Record<string, Table>>(
  schema: T,
): SchemaModifier<T, BaseSchema<T>, {}, never>;
