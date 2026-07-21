import {
  getTableName,
  isTable,
  type Relation,
  type AnyRelationsBuilderConfig,
  type ExtractTablesWithRelationsParts,
  type Many,
  type One,
  type Table,
  type AnyRelation,
  type IfThenElse,
} from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  type BuildSchema,
  type CoerceOptions,
} from "drizzle-orm/zod";
import z from "zod";
import type {
  ForceAccess,
  ExtractInnerObject,
  IsNever,
  MergeBehaviour,
  MergeUnion,
  UnionIsEmpty,
} from "../helpers.types";
import { modificationPipe, type ModificationPipe } from "../pipe";
import type {
  Diff,
  CreateDiff,
  EmptyDiff,
  ApplyDiff,
  MergeDiffs,
} from "./diff.types";

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
>;

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
export type Relations<
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

type ModifiedSchema<
  T extends Record<string, Table> = Record<string, Table>,
  TSchema extends BaseSchema<T> = BaseSchema<T>,
  TModifications extends Modifications<TSchema> = Modifications<TSchema>,
> = {
  [Key in keyof TSchema]: ApplyDiffsByOperation<
    TSchema[Key] & Record<Operations, object>,
    TModifications[Key]
  >;
};

type SelectNestedRelations<
  TRelations extends Relations,
  TKey extends keyof TRelations,
> =
  TRelations[TKey] extends infer ERelation ?
    ERelation extends Record<string, AnyRelation> ?
      IfThenElse<
        UnionIsEmpty<keyof ERelation>,
        never,
        {
          [RKey in keyof ERelation]?:
            | true
            | (ERelation[RKey] extends Relation<infer ETargetTableName> ?
                SelectNestedRelations<TRelations, ETargetTableName>
              : never);
        }
      >
    : never
  : never;
type SelectNestedRelationsToSchema<
  TModifiedSchema extends ModifiedSchema,
  TRelations extends ExtractTablesWithRelationsParts<
    AnyRelationsBuilderConfig,
    Record<string, Table>
  >,
  TCurrentEntry extends keyof TModifiedSchema,
  TSelectedNestedRelations extends SelectNestedRelations<
    Relations,
    keyof Relations
  >,
> = z.ZodObject<
  ExtractInnerObject<TModifiedSchema[TCurrentEntry]["select"]>
    & (TSelectedNestedRelations extends true ? object
    : IsNever<keyof TSelectedNestedRelations> extends true ? object
    : {
        [Key in keyof TSelectedNestedRelations]: ForceAccess<
          ForceAccess<Relations<TRelations>, TCurrentEntry> & object,
          Key
        > extends infer ECurrentRelation ?
          ECurrentRelation extends Relation<infer ETargetTable> ?
            SelectNestedRelationsToSchema<
              TModifiedSchema,
              TRelations,
              ETargetTable,
              TSelectedNestedRelations[Key]
            > extends infer EInner extends z._ZodType ?
              ECurrentRelation extends One<ETargetTable, infer EOptional> ?
                IfThenElse<EOptional, z.ZodOptional<EInner>, EInner>
              : ECurrentRelation extends Many<ETargetTable> ? z.ZodArray<EInner>
              : never
            : never
          : never
        : never;
      })
>;

type ModifiedSchemaWithRelations<
  T extends Record<string, Table>,
  TSchema extends BaseSchema<T>,
  TModifications extends Modifications<TSchema>,
  TRelations extends
    | ExtractTablesWithRelationsParts<AnyRelationsBuilderConfig, T>
    | never = never,
  _TModifiedSchema extends ModifiedSchema<T, TSchema, TModifications> =
    ModifiedSchema<T, TSchema, TModifications>,
> = {
  [Key in keyof _TModifiedSchema]: _TModifiedSchema[Key]
    & ([TRelations] extends [never] ? object
    : {
        selectWith: <
          TSelectedNestedRelations extends SelectNestedRelations<
            Relations<TRelations>,
            Key & keyof Relations<TRelations>
          >,
        >(
          nestedRelations: TSelectedNestedRelations,
        ) => SelectNestedRelationsToSchema<
          _TModifiedSchema,
          TRelations,
          Key,
          TSelectedNestedRelations
        >;
      });
};

type _FlattenModifiedSchema<
  T extends Record<string, Table>,
  TSchema extends BaseSchema<T>,
  TModifications extends Modifications<TSchema>,
  TMergeBehaviour extends MergeBehaviour,
  TValues extends ModifiedSchema<T, TSchema, TModifications> = ModifiedSchema<
    T,
    TSchema,
    TModifications
  >,
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
    [Operation in Operations]: Operation extends keyof TDiff ?
      MergeDiffs<TModifications[Key][Operation], TDiff[Operation]>
    : TModifications[Key][Operation];
  };
};

type MergeDiffToModification<
  TModifications extends Modifications<BaseSchema>,
  TKey extends keyof TModifications,
  TDiff extends Record<Operations, Diff>,
> = {
  [Key in keyof TModifications]: IfThenElse<
    Equals<Key, TKey>,
    MergeDiffsByOperation<TModifications[Key], TDiff>,
    TModifications[Key]
  >;
};

type SimpleSchemaModifier = {
  create: () => Record<string, SchemaGroup>;
  modifyAll: (
    factory: (base: SchemaGroup) => Partial<SchemaGroup>,
  ) => SimpleSchemaModifier;
  modify: (
    key: string,
    factory: (base: SchemaGroup) => Partial<SchemaGroup>,
  ) => SimpleSchemaModifier;
  modifyUnited: (
    key: string,
    factory: (base: z.ZodObject) => z.ZodObject,
  ) => SimpleSchemaModifier;
  withRelations: (
    relations: ExtractTablesWithRelationsParts<
      AnyRelationsBuilderConfig,
      Record<string, Table>
    >,
  ) => SimpleSchemaModifier;
};

type SchemaModifier<
  T extends Record<string, Table>,
  TSchema extends BaseSchema<T> = BaseSchema<T>,
  TModifications extends Modifications<TSchema> = Record<
    keyof TSchema,
    Record<Operations, EmptyDiff>
  >,
  TRelations extends
    | ExtractTablesWithRelationsParts<AnyRelationsBuilderConfig, T>
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
   * Modify a specific entry in the schema
   *
   * @returns a new instance of {@link SchemaModifier} with the given modification
   */
  modify: <
    Key extends keyof TSchema,
    Base extends ApplyDiffsByOperation<
      TSchema[Key] & Record<Operations, object>,
      TModifications[Key]
    >,
    CModification extends Partial<Record<Operations, z.ZodObject>>,
  >(
    key: Key,
    factory: (input: Base) => GuardModification<CModification, Base>,
  ) => SchemaModifier<
    T,
    TSchema,
    MergeDiffToModification<
      TModifications,
      Key,
      CreateDiffsByOperation<Base, CModification>
    >,
    TRelations
  >;

  modifyUnited: <
    Key extends keyof TSchema,
    BaseUnited extends MergeUnion<
      Values<
        ApplyDiffsByOperation<
          TSchema[Key] & Record<Operations, object>,
          TModifications[Key]
        >
      >,
      "strict"
    >,
    CModificationUnited extends z.ZodObject,
  >(
    key: Key,
    factory: (
      input: BaseUnited,
    ) => Guard<
      Equals<CModificationUnited, BaseUnited>,
      "Unnecessary Modification: Modified Schema is equal to base schema",
      CModificationUnited
    >,
  ) => SchemaModifier<
    T,
    TSchema,
    MergeDiffToModification<
      TModifications,
      Key,
      MergeDiffsByOperation<
        TModifications[Key],
        Record<
          Operations,
          CreateDiff<
            ExtractInnerObject<BaseUnited>,
            ExtractInnerObject<CModificationUnited>
          >
        >
      >
    >,
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

  withRelations: <
    TNewRelation extends ExtractTablesWithRelationsParts<
      AnyRelationsBuilderConfig,
      T
    >,
  >(
    relation: TNewRelation,
  ) => SchemaModifier<T, TSchema, TModifications, TNewRelation>;

  modifications: TModifications;
};

const createBaseSchemaGroup = (table: Table) => ({
  insert: createInsertSchema(table),
  select: createSelectSchema(table),
  update: createUpdateSchema(table),
});

const selectWithRelations =
  (
    modifiedSchema: Record<string, SchemaGroup>,
    relations: Record<string, Record<string, Relation<string>>>,
    currentEntry: string,
  ) =>
  (selectedRelations: Record<string, unknown>) => {
    if (!(currentEntry in modifiedSchema) || !modifiedSchema[currentEntry])
      throw new Error("Invalid key");
    let selectWithRelationSchema = modifiedSchema[currentEntry].select;
    for (const key in selectedRelations) {
      const cur = selectedRelations[key];
      if (!cur) continue;
      const currentRelation = relations[currentEntry]?.[key];
      if (!currentRelation) throw new Error("Invalid relation");
      if (!isTable(currentRelation.targetTable))
        throw new Error("Relation target is not a table");
      const target = getTableName(currentRelation.targetTable);
      if (!modifiedSchema[target])
        throw new Error("Relation target not found in source schema");

      const innerSchema =
        typeof selectedRelations[key] === "object" ?
          selectWithRelations(
            modifiedSchema,
            relations,
            target,
          )(selectedRelations[key] as Record<string, unknown>)
        : modifiedSchema[target].select;

      const inner =
        currentRelation.relationType === "one" ?
          (<One<string>>currentRelation).optional ?
            z.optional(innerSchema)
          : innerSchema
        : z.array(innerSchema);

      selectWithRelationSchema = selectWithRelationSchema.extend({
        [key]: inner,
      });
    }
    return selectWithRelationSchema;
  };

const createModifiedSchema = (
  schema: Record<string, Table>,
  modifications: Record<string, ModificationPipe<SchemaGroup>>,
  relations?: ExtractTablesWithRelationsParts<
    AnyRelationsBuilderConfig,
    Record<string, Table>
  >,
): Record<string, SchemaGroup> => {
  const modifiedSchema = getEntries(schema)
    .map(([key, value]) => {
      const baseSchemaGroup = createBaseSchemaGroup(value);
      return {
        [getTableName(value)]: {
          ...baseSchemaGroup,
          ...modifications[key]?.(baseSchemaGroup),
        },
      };
    })
    .reduce((prev, cur) => ({ ...prev, ...cur }), {});
  if (!relations) return modifiedSchema;

  const modifiedSchemaWithRelations: Record<
    string,
    SchemaGroup & {
      selectWith?: (relations: Record<string, unknown>) => z._ZodType;
    }
  > = modifiedSchema;

  const relationsByTableName: Record<
    string,
    Record<string, Relation<string>>
  > = {};

  for (const key in relations) {
    const cur = relations[key];
    if (!cur) continue;
    const schemaEntry = modifiedSchemaWithRelations[getTableName(cur.table)];
    if (!schemaEntry) continue;
    relationsByTableName[getTableName(cur.table)] = cur.relations;
    schemaEntry.selectWith = selectWithRelations(
      modifiedSchema,
      relationsByTableName,
      key,
    );
  }

  return modifiedSchema;
};

const internalSchemaModifier = (
  schema: Record<string, Table>,
  modifications: Record<string, ModificationPipe<SchemaGroup>>,
  modificationsUnited: Record<string, ModificationPipe<z.ZodObject>>,
  relations?: ExtractTablesWithRelationsParts<
    AnyRelationsBuilderConfig,
    Record<string, Table>
  >,
): SimpleSchemaModifier => ({
  create: () => createModifiedSchema(schema, modifications, relations),
  modify: (key, factory) =>
    internalSchemaModifier(
      schema,
      {
        ...modifications,
        [key]: optional(modifications[key]).orThrow().func(factory),
      },
      modificationsUnited,
      relations,
    ),
  modifyUnited: (key, factory) =>
    internalSchemaModifier(
      schema,
      modifications,
      {
        ...modificationsUnited,
        [key]: optional(modificationsUnited[key]).orThrow().func(factory),
      },
      relations,
    ),
  modifyAll: (factory) =>
    internalSchemaModifier(
      schema,
      getEntries(modifications)
        .map(([key, value]) => ({ [key]: value.func(factory) }))
        .reduce((prev, cur) => ({ ...prev, ...cur }), {}),
      modificationsUnited,
      relations,
    ),
  withRelations: (newRelations) =>
    internalSchemaModifier(
      schema,
      modifications,
      modificationsUnited,
      newRelations,
    ),
});

export const schemaModifier = <T extends Record<string, Table>>(
  schema: T,
): SchemaModifier<T> =>
  internalSchemaModifier(
    schema,
    getKeys(schema)
      .map((key) => ({ [key]: modificationPipe<SchemaGroup>() }))
      .reduce((prev, cur) => ({ ...prev, ...cur }), {}),
    getKeys(schema)
      .map((key) => ({ [key]: modificationPipe<z.ZodObject>() }))
      .reduce((prev, cur) => ({ ...prev, ...cur }), {}),
  ) as unknown as SchemaModifier<T>;
