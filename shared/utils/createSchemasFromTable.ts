import {
  getTableName,
  type AnyRelation,
  type AnyRelationsBuilderConfig,
  type ExtractTablesWithRelationsParts,
  type IfThenElse,
  type Many,
  type One,
  type Relation,
  type Table,
} from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  type BuildSchema,
  type CoerceOptions,
} from "drizzle-orm/zod";
import * as z from "zod";
import type { Equals, Extends, Guard, UnionIsEmpty } from "./helperTypes";
import { convertCase } from "./stringUtils";

export type SchemaGroup<
  Insert extends z._ZodType = z.ZodObject,
  Select extends z._ZodType = z.ZodObject,
  Update extends z._ZodType = z.ZodObject,
> = { insert: Insert; select: Select; update: Update };

export type BaseSchemaGroup<TTable extends Table> = SchemaGroup<
  BuildSchema<"insert", TTable["_"]["columns"], undefined, CoerceOptions>,
  BuildSchema<"select", TTable["_"]["columns"], undefined, CoerceOptions>,
  BuildSchema<"update", TTable["_"]["columns"], undefined, CoerceOptions>
>;

export type Schemas<T extends Record<string, Table> = Record<string, Table>> = {
  [Key in keyof T as T[Key]["_"]["name"]]: BaseSchemaGroup<T[Key]>;
};
type Modification<BaseSchema extends Schemas> = {
  [Key in keyof BaseSchema]?: Partial<BaseSchema[Key]>;
};
type ModifiedSchema<
  BaseSchema extends Schemas = Schemas,
  Modifications extends Modification<BaseSchema> = Modification<BaseSchema>,
> = {
  [Key in keyof BaseSchema]: IfThenElse<
    Extends<Key, keyof Modifications>,
    Omit<BaseSchema[Key], keyof Modifications[Key]>
      & Required<Modifications[Key]>
      & Record<"select" | "insert" | "update", object>,
    BaseSchema[Key]
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

type RestructuredRelations<
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

type GetRelationInfo<
  TRelations extends RestructuredRelations,
  TSourceName extends keyof TRelations,
  TRelationName extends keyof TRelations[TSourceName],
> = TRelations[TSourceName][TRelationName];

type SelectNestedRelations<
  TableName extends string,
  TRelations extends RestructuredRelations,
> =
  TRelations[TableName] extends infer ERelation ?
    ERelation extends Record<string, AnyRelation> ?
      IfThenElse<
        UnionIsEmpty<keyof ERelation>,
        never,
        {
          [RKey in keyof ERelation]?:
            | true
            | (ERelation[RKey] extends Relation<infer ETargetTableName> ?
                SelectNestedRelations<ETargetTableName, TRelations>
              : never);
        }
      >
    : never
  : never;

type SchemaWithSelectedNestedRelations<
  TBaseSchema extends Schemas,
  TModifications extends Modification<TBaseSchema>,
  TModifiedSchema extends ModifiedSchema<TBaseSchema, TModifications>,
  CurrentEntry extends keyof TModifiedSchema,
  TRelations extends RestructuredRelations,
  TSelectedNestedRelations extends SelectNestedRelations<string, TRelations>,
> =
  TModifiedSchema[CurrentEntry]["select"] extends (
    z.ZodObject<infer EInnerObject>
  ) ?
    z.ZodObject<
      EInnerObject & {
        [Key in keyof TSelectedNestedRelations]: GetRelationInfo<
          TRelations,
          CurrentEntry & keyof TRelations,
          Key & keyof TRelations[CurrentEntry & keyof TRelations]
        > extends infer ECurrentRelation ?
          ECurrentRelation extends Relation<infer ETargetTable> ?
            SchemaWithSelectedNestedRelations<
              TBaseSchema,
              TModifications,
              TModifiedSchema,
              ETargetTable,
              TRelations,
              TSelectedNestedRelations[Key]
            > extends infer ERecursiveType extends z._ZodType ?
              ECurrentRelation extends One<ETargetTable, infer EIsOptional> ?
                IfThenElse<
                  EIsOptional,
                  z.ZodOptional<ERecursiveType>,
                  ERecursiveType
                >
              : ECurrentRelation extends Many<ETargetTable> ?
                z.ZodArray<ERecursiveType>
              : never
            : never
          : never
        : never;
      }
    >
  : never;

type ModifiedSchemaWithRelations<
  TBaseSchema extends Schemas = Schemas,
  TModifications extends Modification<TBaseSchema> = Modification<TBaseSchema>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchemaRelations extends ExtractTablesWithRelationsParts<any, any> =
    ExtractTablesWithRelationsParts<any, any>,
  TRestructuredRelations extends RestructuredRelations =
    RestructuredRelations<TSchemaRelations>,
  TModifiedSchema extends ModifiedSchema<TBaseSchema, TModifications> =
    ModifiedSchema<TBaseSchema, TModifications>,
> = {
  [Key in keyof TModifiedSchema]: TModifiedSchema[Key]
    & (SelectNestedRelations<Key & string, TRestructuredRelations> extends (
      infer ESelectNestedRelations
    ) ?
      IfThenElse<
        UnionIsEmpty<ESelectNestedRelations>,
        object,
        {
          selectWithRelations: <
            TSelectedRelations extends SelectNestedRelations<
              Key & string,
              TRestructuredRelations
            >,
          >(
            selectedRelations: TSelectedRelations,
          ) => SchemaWithSelectedNestedRelations<
            TBaseSchema,
            TModifications,
            TModifiedSchema,
            Key,
            TRestructuredRelations,
            TSelectedRelations
          >;
        }
      >
    : never);
};

type SchemaModifier<
  BaseSchema extends Schemas,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Modifications extends Modification<BaseSchema> = {},
> = {
  create: () => ModifiedSchema<BaseSchema, Modifications>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withRelations: <TRelations extends ExtractTablesWithRelationsParts<any, any>>(
    relations: TRelations,
  ) => {
    create: () => ModifiedSchemaWithRelations<
      BaseSchema,
      Modifications,
      TRelations
    >;
  };
  modify: <
    MKey extends Exclude<keyof BaseSchema, keyof Modifications>,
    MSchema extends Partial<SchemaGroup>,
  >(
    key: MKey,
    factory: (
      baseSchemas: BaseSchema[MKey],
    ) => Guard<
      Equals<BaseSchema[MKey], MSchema>,
      "Unnecessary modification: Modified schemas are the same as the base schemas",
      MSchema
    >,
  ) => SchemaModifier<BaseSchema, Modifications & Record<MKey, MSchema>>;
};

export type InferModifiedSchema<TModifiedSchema extends ModifiedSchema> = {
  [Key in keyof TModifiedSchema]: {
    [NKey in keyof SchemaGroup]: z.infer<TModifiedSchema[Key][NKey]>;
  };
};

export type InferInnerSchema<
  TInferredModifiedSchema extends InferModifiedSchema<ModifiedSchema>,
  Inner extends keyof SchemaGroup,
> = {
  [Key in keyof TInferredModifiedSchema]: TInferredModifiedSchema[Key][Inner];
};

// TODO
//export type SelectWith<TModifiedSchemaWithRelations extends ModifiedSchemaWithRelations, TKey extends keyof TModifiedSchemaWithRelations, TSelectedNestedRelations extends SelectNestedRelations> = ;

export function createSchemaModifier<T extends Record<string, Table>>(
  schema: T,
): SchemaModifier<Schemas<T>> {
  return new InternalSchemaModifier(schema) as unknown as SchemaModifier<
    Schemas<T>
  >;
}

class InternalSchemaModifier<T extends Record<string, Table>> {
  private readonly modifications: Partial<
    Record<string, (baseSchemas: SchemaGroup) => Partial<SchemaGroup>>
  > = {};

  constructor(private readonly schema: T) {}

  modify(
    key: string,
    factory: (baseSchemas: SchemaGroup) => Partial<SchemaGroup>,
  ) {
    this.modifications[key] = factory;
    return this;
  }

  create() {
    const modifiedSchema: Record<string, SchemaGroup> = {};
    for (const key in this.schema) {
      const table = this.schema[key];
      if (!table) continue;

      const baseSchemaGroup = {
        insert: createInsertSchema(table),
        select: createSelectSchema(table),
        update: createUpdateSchema(table),
      };
      const modifiedSchemaGroup =
        key in this.modifications ?
          this.modifications[key]?.(baseSchemaGroup)
        : undefined;
      modifiedSchema[key] = { ...baseSchemaGroup, ...modifiedSchemaGroup };
    }
    return modifiedSchema;
  }

  private static selectWithRelation(
    modifiedSchema: Record<string, SchemaGroup>,
    relations: Record<string, Record<string, Relation<string>>>,
    currentEntry: string,
    selectedRelations: Record<string, unknown>,
  ): z.ZodObject {
    if (!(currentEntry in modifiedSchema) || !modifiedSchema[currentEntry])
      throw new Error("Invalid key");
    const currentSelectSchema = modifiedSchema[currentEntry].select;
    let selectWithRelationSchema = currentSelectSchema;
    for (const key in selectedRelations) {
      if (!selectedRelations[key]) continue;
      const currentRelation = relations[currentEntry]?.[key];
      if (!currentRelation) throw new Error("Invalid relation");
      const target = convertCase(currentRelation.targetTableName, "camelCase");
      if (!modifiedSchema[target]) throw new Error("Relation target not found");

      const innerSchema =
        typeof selectedRelations[key] === "object" ?
          InternalSchemaModifier.selectWithRelation(
            modifiedSchema,
            relations,
            target,
            selectedRelations[key] as Record<string, unknown>,
          )
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
  }

  withRelations(
    relations: ExtractTablesWithRelationsParts<AnyRelationsBuilderConfig, T>,
  ) {
    const modifiedSchema = this.create();
    const schemaWithRelationsExtension: Record<
      string,
      SchemaGroup & {
        selectWithRelations?: (
          relations: Record<string, unknown>,
        ) => z._ZodType;
      }
    > = { ...modifiedSchema };
    const relationsByTableName: Record<
      string,
      Record<string, Relation<string>>
    > = {};
    for (const key in relations) {
      const relation = relations[key];
      if (!relation) continue;
      const tableName = getTableName(relation.table);
      if (!tableName) continue;
      relationsByTableName[convertCase(tableName, "camelCase")] =
        relation.relations;
    }

    for (const key in relationsByTableName) {
      if (!schemaWithRelationsExtension[key]) continue;
      schemaWithRelationsExtension[key].selectWithRelations = (
        selectedRelations,
      ) =>
        InternalSchemaModifier.selectWithRelation(
          modifiedSchema,
          relationsByTableName,
          key,
          selectedRelations,
        );
    }
    return schemaWithRelationsExtension;
  }
}
