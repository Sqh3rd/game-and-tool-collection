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
  IsNever,
  MergeBehaviour,
  MergeUnion,
} from "./helperTypes";

type Operations = "insert" | "select" | "update";

type SchemaGroup<
  Insert extends z.ZodObject = z.ZodObject,
  Select extends z.ZodObject = z.ZodObject,
  Update extends z.ZodObject = z.ZodObject,
> = { insert: Insert; select: Select; update: Update };

type SchemaGroupFromTable<TTable extends Table> = SchemaGroup<
  BuildSchema<"insert", TTable["_"]["columns"], undefined, CoerceOptions>,
  BuildSchema<"select", TTable["_"]["columns"], undefined, CoerceOptions>,
  BuildSchema<"update", TTable["_"]["columns"], undefined, CoerceOptions>
>
  & Record<Operations, z.ZodObject>;

type BaseSchema<T extends Record<string, Table> = Record<string, Table>> = {
  [Key in keyof T as T[Key]["_"]["name"]]: SchemaGroupFromTable<T[Key]>;
};
type ModificationsByOperation = Record<Operations, Diff>;
type Modifications<T extends BaseSchema> = Record<
  keyof T,
  ModificationsByOperation
>;

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

// type ModifyEntry<T extends Record<string, Table>, TSchema extends BaseSchema<>>;

type ModifiedSchemaWithRelations<
  T extends Record<string, Table>,
  TSchema extends BaseSchema<T>,
  TModifications extends Modifications<TSchema>,
  TRelations extends
    | Relations<ExtractTablesWithRelationsParts<AnyRelationsBuilderConfig, T>>
    | never = never,
> = {
  [Key in keyof T]: ApplyDiffsByOperation<TSchema[Key], TModifications[Key]>;
} & IfThenElse<
  IsNever<TRelations>,
  object,
  { selectWithRelations: () => void }
>;

type _FlattenModifiedSchema<
  T extends Record<string, Table>,
  TSchema extends BaseSchema<T>,
  TModifications extends Modifications<TSchema>,
  TMergeBehaviour extends MergeBehaviour,
  TValues extends ModifiedSchemaWithRelations<T, TSchema, TModifications> =
    ModifiedSchemaWithRelations<T, TSchema, TModifications>,
> = {
  [Operation in Operations]: MergeUnion<
    keyof TValues extends infer EKey ?
      EKey extends keyof TValues ?
        TValues[EKey][Operation] extends z.ZodObject<infer Inner> ?
          Inner
        : never
      : never
    : never,
    TMergeBehaviour
  >;
};

type FlattenModifiedSchema<
  T extends Record<string, Table>,
  TSchema extends BaseSchema<T>,
  TModifications extends Modifications<TSchema>,
  TMergeBehaviour extends MergeBehaviour,
  TFlat extends _FlattenModifiedSchema<
    T,
    TSchema,
    TModifications,
    TMergeBehaviour
  > = _FlattenModifiedSchema<T, TSchema, TModifications, TMergeBehaviour>,
> = {
  [Key in keyof TFlat]: z.ZodObject<
    TFlat[Key] extends z.ZodRawShape ? TFlat[Key] : z.ZodRawShape
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

type Diff = {
  // Keys and values that were added
  added: object;
  // Keys that were removed
  removed: symbol | string | number;
  // Keys that were changed
  changed: Record<
    string | symbol | number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { before: any; after: any; diff: Diff }
  >;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EmptyDiff = { added: {}; removed: never; changed: {} };

type GetChangedKeys<Before extends object, After extends object> =
  keyof Before & keyof After extends infer Key ?
    Key extends keyof Before & keyof After ?
      Equals<After[Key & keyof After], Before[Key & keyof Before]> extends (
        true
      ) ?
        never
      : Key
    : never
  : never;
type CreateDiff<Before extends object, After extends object> =
  Equals<Before, After> extends false ?
    {
      added: Omit<After, keyof Before>;
      removed: Exclude<keyof Before, keyof After>;
      changed: {
        [Key in GetChangedKeys<Before, After>]: {
          before: Before[Key];
          after: After[Key];
          diff: After[Key] extends object ?
            Before[Key] extends object ?
              CreateDiff<Before[Key], After[Key]>
            : EmptyDiff
          : EmptyDiff;
        };
      };
    }
  : EmptyDiff;

type ApplyDiff<TSource extends object, TDiff extends Diff> = Omit<
  TSource,
  keyof TDiff["changed"] | TDiff["removed"]
>
  & TDiff["added"]
  & IfThenElse<
    IsNever<keyof TDiff["changed"]>,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {},
    { [Key in keyof TDiff["changed"]]: TDiff["changed"][Key]["after"] }
  >;

type MergeDiffs<TDBefore extends Diff, TDAfter extends Diff> = {
  added: Omit<TDBefore["added"], TDAfter["removed"]> & TDAfter["added"];
  removed: Exclude<TDBefore["removed"], TDAfter["added"]> | TDAfter["removed"];
  changed: {
    [Key in Exclude<
      keyof TDBefore["changed"],
      TDAfter["removed"] | TDAfter["changed"]
    >]: {
      before: Key extends keyof TDBefore["changed"] ?
        TDBefore["changed"][Key]["before"]
      : TDAfter["changed"][Key]["before"];
      after: Key extends keyof TDAfter["changed"] ?
        TDAfter["changed"][Key]["after"]
      : TDBefore["changed"][Key]["after"];
      diff: Key extends keyof TDAfter["changed"][Key]["diff"] ?
        Key extends keyof TDBefore["changed"][Key]["diff"] ?
          MergeDiffs<
            TDBefore["changed"][Key]["diff"],
            TDAfter["changed"][Key]["diff"]
          >
        : TDAfter["changed"][Key]["diff"]
      : TDBefore["changed"][Key]["diff"];
    };
  };
};

type CreateDiffsByOperation<
  TBefore extends Record<Operations, object>,
  TAfter extends Partial<Record<Operations, object>>,
> = {
  [Operation in Operations]: Operation extends keyof TAfter ?
    CreateDiff<
      ExtractInnerObject<TBefore[Operation]>,
      ExtractInnerObject<TAfter[Operation]>
    >
  : EmptyDiff;
};

type ApplyDiffsByOperation<
  TSource extends Record<Operations, object>,
  TDiffs extends Partial<Record<Operations, Diff>>,
> = {
  [Operation in Operations]: z.ZodObject<
    Operation extends keyof TDiffs ?
      ApplyDiff<
        ExtractInnerObject<TSource[Operation]>,
        TDiffs[Operation] & object
      >
    : ExtractInnerObject<TSource[Operation]>
  >;
};

type MergeDiffsByOperation<
  TBefore extends Record<Operations, Diff>,
  TAfter extends Partial<Record<Operations, Diff>>,
> = {
  [Operation in Operations]: Operation extends keyof TAfter ?
    MergeDiffs<TBefore[Operation], TAfter[Operation] & object>
  : TBefore[Operation];
};

type MergeDiffToAll<
  TModifications extends Modifications<BaseSchema>,
  TDiff extends Record<Operations, Diff>,
> = {
  [Key in keyof TModifications]: {
    [Operation in Operations]: MergeDiffs<
      TModifications[Key][Operation],
      TDiff[Operation] & object
    >;
  };
};

type SchemaModifier<
  T extends Record<string, Table>,
  TSchema extends BaseSchema<T> = BaseSchema<T>,
  TModifications extends Modifications<TSchema> = Record<
    keyof TSchema,
    Record<Operations, EmptyDiff>
  >,
  TRelations extends
    | Relations<ExtractTablesWithRelationsParts<AnyRelationsBuilderConfig, T>>
    | never = never,
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
   * Applies the given modification to all entries in the schema.
   *
   * @remarks
   *
   * Since the modifications are applied to all entries in the schema, the base
   * schema passed to the factory is to be treated as a strict merge of all
   * entries in the schema. A strict merge in this context refers to an object
   * where the set of keys (keyof) are an intersection of all sets of keys of
   * the entries, and the values of the given keys are an intersection of all
   * possible values that the entries have for the given keys.
   *
   * @returns a new instance of {@link SchemaModifier} with the given modification
   */
  modifyAll: <
    Base extends FlattenModifiedSchema<T, TSchema, TModifications, "strict">,
    CModifications extends Partial<Record<Operations, z.ZodObject>>,
  >(
    factory: (input: Base) => GuardModification<CModifications, Base>,
  ) => SchemaModifier<
    T,
    TSchema,
    MergeDiffToAll<
      TModifications,
      CreateDiffsByOperation<Base, CModifications>
    >,
    TRelations
  >;

  /**
   * Applies the given modification to all applicable entries in the schema.
   * @returns a new instance of {@link SchemaModifier} with the given modification
   */
  modifyApplicable: <
    Base extends FlattenModifiedSchema<T, TSchema, TModifications, "lenient">,
    CModifications extends Partial<Record<Operations, z.ZodObject>>,
  >(
    factory: (input: Base) => GuardModification<CModifications, Base>,
  ) => SchemaModifier<T, TSchema, TModifications, TRelations>;

  /**
   * Modify a specific entry in the schema
   *
   * @returns a new instance of {@link SchemaModifier} with the given modification
   */
  modify: <
    Key extends keyof TSchema,
    Base extends ApplyDiffsByOperation<TSchema[Key], TModifications[Key]>,
    CModification extends Partial<Record<Operations, z.ZodObject>>,
  >(
    key: Key,
    factory: (input: Base) => GuardModification<CModification, Base>,
  ) => SchemaModifier<
    T,
    TSchema,
    TModifications
      & Record<
        Key,
        MergeDiffsByOperation<
          TModifications[Key],
          CreateDiffsByOperation<Base, CModification>
        >
      >,
    TRelations
  >;
};

export declare function schemaModifier<T extends Record<string, Table>>(
  schema: T,
): SchemaModifier<T>;
