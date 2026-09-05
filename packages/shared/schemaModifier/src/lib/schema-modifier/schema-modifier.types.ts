import {
  Equals,
  UnionIsEmpty,
  ForceAccess,
  MergeBehaviour,
  MergeUnion,
  Values,
  Guard,
} from "@gatc/utils";
import { StandardSchemaV1, StandardTypedV1 } from "@standard-schema/spec";
import {
  Table,
  ExtractTablesWithRelationsParts,
  AnyRelationsBuilderConfig,
  IfThenElse,
  One,
  Many,
  AnyRelation,
  Relation,
  IsNever,
} from "drizzle-orm";
import { BuildSchema, CoerceOptions } from "drizzle-orm/zod";
import {
  Diff,
  CreateDiff,
  EmptyDiff,
  ApplyDiff,
  MergeDiffs,
} from "../diff.types";

export type Operations = "insert" | "select" | "update";

export type SchemaGroup<
  Insert extends StandardSchemaV1<object> = StandardSchemaV1<object>,
  Select extends StandardSchemaV1<object> = StandardSchemaV1<object>,
  Update extends StandardSchemaV1<object> = StandardSchemaV1<object>,
> = { insert: Insert; select: Select; update: Update };

export type SchemaGroupFromTable<TTable extends Table> = SchemaGroup<
  BuildSchema<"insert", TTable["_"]["columns"], undefined, CoerceOptions>,
  BuildSchema<"select", TTable["_"]["columns"], undefined, CoerceOptions>,
  BuildSchema<"update", TTable["_"]["columns"], undefined, CoerceOptions>
>;

export type SimpleSchema<
  T extends Record<string, Table> = Record<string, Table>,
> = { [Key in keyof T as T[Key]["_"]["name"]]: SchemaGroup };
export type ModificationsByOperation = Record<Operations, Diff>;
export type Modifications<T extends SimpleSchema> = Record<
  keyof T,
  ModificationsByOperation
>;

export type GetTableByRelationName<
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
    [
      RKey in keyof TRelations[Key]["relations"]
    ]: TRelations[Key]["relations"][RKey] extends infer ERelation ?
      ERelation extends One<infer ETarget, infer EOptional> ?
        One<GetTableByRelationName<TRelations, ETarget>, EOptional>
      : ERelation extends Many<infer ETarget> ?
        Many<GetTableByRelationName<TRelations, ETarget>>
      : ERelation
    : never;
  };
};

export type ModifiedSchema<
  T extends Record<string, Table> = Record<string, Table>,
  TSchema extends SimpleSchema<T> = SimpleSchema<T>,
  TModifications extends Modifications<TSchema> = Modifications<TSchema>,
> = {
  [Key in keyof TSchema]: ApplyDiffsByOperation<
    TSchema[Key] & Record<Operations, StandardSchemaV1<object>>,
    TModifications[Key]
  >;
};

export type SelectNestedRelations<
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
export type SelectNestedRelationsToSchema<
  T extends Record<string, Table>,
  TSchema extends SimpleSchema<T>,
  TModifications extends Modifications<TSchema>,
  TModifiedSchema extends ModifiedSchema<T, TSchema, TModifications>,
  TRelations extends ExtractTablesWithRelationsParts<
    AnyRelationsBuilderConfig,
    Record<string, Table>
  >,
  TCurrentEntry extends keyof TModifiedSchema,
  TSelectedNestedRelations extends SelectNestedRelations<
    Relations,
    keyof Relations
  >,
> = StandardSchemaV1<
  StandardTypedV1.InferOutput<TModifiedSchema[TCurrentEntry]["select"]>
    & (TSelectedNestedRelations extends true ? object
    : IsNever<keyof TSelectedNestedRelations> extends true ? object
    : {
        [Key in keyof TSelectedNestedRelations]: ForceAccess<
          ForceAccess<Relations<TRelations>, TCurrentEntry> & object,
          Key
        > extends infer ECurrentRelation ?
          ECurrentRelation extends Relation<infer ETargetTable> ?
            SelectNestedRelationsToSchema<
              T,
              TSchema,
              TModifications,
              TModifiedSchema,
              TRelations,
              ETargetTable,
              TSelectedNestedRelations[Key]
            > extends infer EInner extends StandardSchemaV1 ?
              ECurrentRelation extends One<ETargetTable, infer EOptional> ?
                IfThenElse<EOptional, EInner | undefined, EInner>
              : ECurrentRelation extends Many<ETargetTable> ? EInner[]
              : never
            : never
          : never
        : never;
      })
>;

export type ModifiedSchemaWithRelations<
  T extends Record<string, Table>,
  TSchema extends SimpleSchema<T>,
  TModifications extends Modifications<TSchema>,
  TRelations extends ExtractTablesWithRelationsParts<
    AnyRelationsBuilderConfig,
    T
  > = never,
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
          T,
          TSchema,
          TModifications,
          _TModifiedSchema,
          TRelations,
          Key,
          TSelectedNestedRelations
        >;
      });
};

export type _FlattenModifiedSchema<
  T extends Record<string, Table>,
  TSchema extends SimpleSchema<T>,
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
        TValues[EKey][Operation] extends StandardSchemaV1 ?
          StandardTypedV1.InferOutput<TValues[EKey][Operation]>
        : never
      : never
    : never,
    TMergeBehaviour
  >;
};

export type FlattenModifiedSchema<
  T extends Record<string, Table>,
  TSchema extends SimpleSchema<T>,
  TModifications extends Modifications<TSchema>,
  TMergeBehaviour extends MergeBehaviour,
  TFlat extends _FlattenModifiedSchema<
    T,
    TSchema,
    TModifications,
    TMergeBehaviour
  > = _FlattenModifiedSchema<T, TSchema, TModifications, TMergeBehaviour>,
> = { [Key in keyof TFlat]: StandardSchemaV1<TFlat[Key]> };

export type SharedPropertiesEqual<A extends object, B extends object> =
  keyof A | keyof B extends infer Key ?
    Key extends keyof A ?
      Key extends keyof B ?
        Equals<A[Key], B[Key]>
      : never
    : never
  : never;
export type GuardEqualSharedProperties<
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

export type CreateDiffsByOperation<
  TBefore extends Record<Operations, StandardSchemaV1<object>>,
  TAfter extends Partial<Record<Operations, StandardSchemaV1<object>>>,
> = {
  [Operation in Operations]: Operation extends keyof TAfter ?
    CreateDiff<
      StandardTypedV1.InferOutput<TBefore[Operation]>,
      StandardTypedV1.InferOutput<TAfter[Operation] & StandardSchemaV1<object>>
    >
  : EmptyDiff;
};

export type ApplyDiffsByOperation<
  TSource extends Record<Operations, StandardSchemaV1<object>>,
  TDiffs extends Partial<Record<Operations, Diff>>,
> = {
  [Operation in Operations]: StandardSchemaV1<
    Operation extends keyof TDiffs ?
      ApplyDiff<
        StandardTypedV1.InferOutput<TSource[Operation]>,
        TDiffs[Operation] & object
      >
    : StandardTypedV1.InferOutput<TSource[Operation]>
  >;
};

export type MergeDiffsByOperation<
  TBefore extends Record<Operations, Diff>,
  TAfter extends Partial<Record<Operations, Diff>>,
> = {
  [Operation in Operations]: Operation extends keyof TAfter ?
    MergeDiffs<TBefore[Operation], TAfter[Operation] & object>
  : TBefore[Operation];
};

export type MergeDiffToAll<
  TModifications extends Modifications<SimpleSchema>,
  TDiff extends Record<Operations, Diff>,
> = {
  [Key in keyof TModifications]: {
    [Operation in Operations]: Operation extends keyof TDiff ?
      MergeDiffs<TModifications[Key][Operation], TDiff[Operation]>
    : TModifications[Key][Operation];
  };
};

export type MergeDiffToModification<
  TModifications extends Modifications<SimpleSchema>,
  TKey extends keyof TModifications,
  TDiff extends Record<Operations, Diff>,
> = {
  [Key in keyof TModifications]: IfThenElse<
    Equals<Key, TKey>,
    MergeDiffsByOperation<TModifications[Key], TDiff>,
    TModifications[Key]
  >;
};

export type SimpleSchemaModifier = {
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
    factory: (base: StandardSchemaV1) => StandardSchemaV1,
  ) => SimpleSchemaModifier;
  withRelations: (
    relations: ExtractTablesWithRelationsParts<
      AnyRelationsBuilderConfig,
      Record<string, Table>
    >,
  ) => SimpleSchemaModifier;
};

export type SchemaModifier<
  TSpecificSchema extends StandardSchemaV1<object>,
  T extends Record<string, Table>,
  TSchema extends SimpleSchema<T> = SimpleSchema<T>,
  TModifications extends Modifications<TSchema> = Record<
    keyof TSchema,
    Record<Operations, EmptyDiff>
  >,
  TRelations extends ExtractTablesWithRelationsParts<
    AnyRelationsBuilderConfig,
    T
  > = never,
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
      TSchema[Key] & Record<Operations, StandardSchemaV1<object>>,
      TModifications[Key]
    >,
    CModification extends Partial<Record<Operations, StandardSchemaV1<object>>>,
  >(
    key: Key,
    factory: (input: Base) => GuardModification<CModification, Base>,
  ) => SchemaModifier<
    TSpecificSchema,
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
          TSchema[Key] & Record<Operations, StandardSchemaV1<object>>,
          TModifications[Key]
        >
      >,
      "strict"
    >,
    CModificationUnited extends StandardSchemaV1<object>,
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
    TSpecificSchema,
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
            StandardTypedV1.InferOutput<BaseUnited>,
            StandardTypedV1.InferOutput<CModificationUnited>
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
    CModifications extends Partial<Record<Operations, TSpecificSchema>>,
  >(
    factory: (input: Base) => GuardModification<CModifications, Base>,
  ) => SchemaModifier<
    TSpecificSchema,
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
  ) => SchemaModifier<
    TSpecificSchema,
    T,
    TSchema,
    TModifications,
    TNewRelation
  >;
};
