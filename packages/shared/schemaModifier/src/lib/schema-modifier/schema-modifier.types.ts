import {
  Equals,
  ForceAccess,
  Guard,
  MergeBehaviour,
  MergeUnion,
  Prettify,
  UnionIsEmpty,
  Values,
} from "@gatc/utils";
import { StandardSchemaV1 } from "@standard-schema/spec";
import {
  AnyRelation,
  AnyRelationsBuilderConfig,
  ExtractTablesWithRelationsParts,
  IfThenElse,
  Many,
  One,
  Relation,
  Table,
} from "drizzle-orm";
import { ApplyDiff, CreateDiff, Diff } from "../diff/diff.types";
import {
  BaseValues,
  PrettifyAdapterObject,
  SchemaBuildAdapter,
  ValidationLibs,
  Wrap,
} from "../standard-schema-adapter/standard-schema-adapter.types";

export type Operations = "insert" | "select" | "update";

export type SchemaGroup<
  TAdapter extends ValidationLibs = ValidationLibs,
  Insert extends BaseValues[TAdapter]["Object"] =
    BaseValues[TAdapter]["Object"],
  Select extends BaseValues[TAdapter]["Object"] =
    BaseValues[TAdapter]["Object"],
  Update extends BaseValues[TAdapter]["Object"] =
    BaseValues[TAdapter]["Object"],
> = { insert: Insert; select: Select; update: Update };

export type SimpleSchema<
  TAdapter extends ValidationLibs,
  T extends Record<string, Table> = Record<string, Table>,
> = {
  [Key in keyof T as T[Key]["_"]["name"]]: SchemaGroup<
    TAdapter,
    SchemaBuildAdapter<"insert", T[Key]>[TAdapter],
    SchemaBuildAdapter<"select", T[Key]>[TAdapter],
    SchemaBuildAdapter<"update", T[Key]>[TAdapter]
  >;
};

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
  TSchema extends Record<string, Record<Operations, StandardSchemaV1>>,
  TRelations extends ExtractTablesWithRelationsParts<
    AnyRelationsBuilderConfig,
    Record<string, Table>
  >,
  TCurrentEntry extends keyof TSchema,
  TSelectedNestedRelations extends SelectNestedRelations<
    Relations,
    keyof Relations
  >,
> = TSchema[TCurrentEntry]["select"]
  & (TSelectedNestedRelations extends true ? "Is true"
  : UnionIsEmpty<keyof TSelectedNestedRelations> extends true ?
    "Is empty object"
  : {
      [Key in keyof TSelectedNestedRelations]: ForceAccess<
        ForceAccess<Relations<TRelations>, TCurrentEntry> & object,
        Key
      > extends infer ECurrentRelation ?
        ECurrentRelation extends Relation<infer ETargetTable> ?
          SelectNestedRelationsToSchema<
            T,
            TSchema,
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
    });

export type SchemaWithRelations<
  TAdapter extends ValidationLibs,
  T extends Record<string, Table>,
  TSchema extends Record<string, Record<Operations, StandardSchemaV1>>,
  TRelations extends ExtractTablesWithRelationsParts<
    AnyRelationsBuilderConfig,
    T
  > = never,
> = {
  [Key in keyof TSchema]: PrettifyInner<TAdapter, TSchema[Key]>
    & ([TRelations] extends [never] ? {}
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
          TRelations,
          Key,
          TSelectedNestedRelations
        >;
      });
};

export type FlattenSchema<
  TAdapter extends ValidationLibs,
  TSchema extends Record<string, Record<Operations, StandardSchemaV1>>,
  TMergeBehaviour extends MergeBehaviour,
> = {
  [Operation in Operations]: Wrap<
    TAdapter,
    MergeUnion<
      Extract<TAdapter, TSchema[keyof TSchema][Operation]>,
      TMergeBehaviour
    >
  >;
};

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

export type MergeModificationToSchema<
  TSchema extends Record<string, Record<Operations, StandardSchemaV1>>,
  TModifiedKey extends keyof TSchema,
  TModification extends Partial<Record<Operations, StandardSchemaV1>>,
> = Omit<TSchema, TModifiedKey> & {
  [Key in TModifiedKey]: Omit<TSchema[TModifiedKey], keyof TModification> & {
    [InnerKey in keyof TModification]-?: NonNullable<TModification[InnerKey]>;
  };
};

export type MergeDiffToAllInSchema<
  TAdapter extends ValidationLibs,
  TSchema extends Record<string, Record<Operations, StandardSchemaV1>>,
  TModification extends Partial<Record<Operations, Diff>>,
> = {
  [Key in keyof TSchema]: Omit<TSchema[Key], keyof TModification> & {
    [
      InnerKey in keyof TModification & Operations
    ]-?: TModification[InnerKey] extends Diff ?
      ApplyValidationDiff<
        TAdapter,
        TSchema[Key][InnerKey],
        TModification[InnerKey]
      >
    : never;
  };
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

type PrettifyInner<TAdapter extends ValidationLibs, T extends object> = {
  [Key in keyof T]: PrettifyAdapterObject<TAdapter, T[Key]>;
} & {};

type CreateValidationDiff<
  TAdapter extends ValidationLibs,
  Before extends object,
  After extends object,
> = CreateDiff<Extract<TAdapter, Before>, Extract<TAdapter, After>>;

type ApplyValidationDiff<
  TAdapter extends ValidationLibs,
  Source extends object,
  TDiff extends Diff,
> = Wrap<TAdapter, ApplyDiff<Extract<TAdapter, Source>, TDiff>>;

export type SchemaModifier<
  TAdapter extends ValidationLibs,
  T extends Record<string, Table>,
  TSchema extends Record<string, Record<Operations, StandardSchemaV1>>,
  TRelations extends ExtractTablesWithRelationsParts<
    AnyRelationsBuilderConfig,
    T
  > = never,
> = {
  /**
   * Create a modified schema
   * @returns
   */
  create: () => Prettify<SchemaWithRelations<TAdapter, T, TSchema, TRelations>>;

  /**
   * Modify a specific entry in the schema
   *
   * @returns a new instance of {@link SchemaModifier} with the given modification
   */
  modify: <
    Key extends keyof TSchema,
    CModification extends Partial<
      Record<Operations, BaseValues[TAdapter]["Object"]>
    >,
  >(
    key: Key,
    factory: (
      input: PrettifyInner<TAdapter, TSchema[Key]>,
    ) => GuardModification<CModification, TSchema[Key]>,
  ) => SchemaModifier<
    TAdapter,
    T,
    MergeModificationToSchema<TSchema, Key, CModification>,
    TRelations
  >;

  modifyUnited: <
    Key extends keyof TSchema,
    BaseUnited extends MergeUnion<Values<TSchema[Key]> & {}>,
    CModificationUnited extends BaseValues[TAdapter]["Object"],
  >(
    key: Key,
    factory: (
      input: PrettifyAdapterObject<TAdapter, BaseUnited>,
    ) => Guard<
      Equals<CModificationUnited, BaseUnited>,
      "Unnecessary Modification: Modified Schema is equal to base schema",
      CModificationUnited
    >,
  ) => SchemaModifier<
    TAdapter,
    T,
    MergeModificationToSchema<
      TSchema,
      Key,
      {
        [InnerKey in Operations]: ApplyValidationDiff<
          TAdapter,
          TSchema[Key][InnerKey],
          CreateValidationDiff<TAdapter, BaseUnited, CModificationUnited>
        >;
      }
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
    Base extends FlattenSchema<TAdapter, TSchema, "strict">,
    CModifications extends Partial<
      Record<Operations, BaseValues[TAdapter]["Object"]>
    >,
  >(
    factory: (
      input: PrettifyInner<TAdapter, Base>,
    ) => GuardModification<CModifications, Base>,
  ) => SchemaModifier<
    TAdapter,
    T,
    MergeDiffToAllInSchema<
      TAdapter,
      TSchema,
      {
        [Key in keyof CModifications]: CreateValidationDiff<
          TAdapter,
          Base[Key & keyof Base] & {},
          CModifications[Key] & {}
        >;
      }
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
  ) => SchemaModifier<TAdapter, T, TSchema, TNewRelation>;
};
