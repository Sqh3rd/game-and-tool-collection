import { relations, schema, type Relations } from "@nuxthub/db";
import {
  extractTablesFromSchema,
  isTable,
  type ExtractTablesWithRelationsParts,
  type IfThenElse,
  type Many,
  type One,
  type Relation,
  type Table
} from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  type BuildSchema,
  type CoerceOptions,
} from "drizzle-orm/zod";
import * as z from "zod";
import type { ConvertCase, Extends, Guard, UnionIsEmpty } from "./helperTypes";

type Schema = typeof schema;
type Tables = {
  [Key in keyof Schema as Schema[Key] extends infer TTable extends Table ?
    ConvertCase<TTable["_"]["name"], "camelCase">
  : never]: Schema[Key];
};
type NicerRelations = {
  [Key in keyof Relations as ConvertCase<
    Key & string,
    "camelCase"
  >]: Relations[Key];
};

type GetRelationsForTable<TName extends keyof Tables> = NicerRelations[TName
  & keyof NicerRelations]["relations"];

type GetTableNameFromNameAndRelation<
  TName extends keyof Tables,
  RKey extends keyof GetRelationsForTable<TName>,
> =
  GetRelationsForTable<TName>[RKey] extends infer Relation ?
    Relation extends (
      | One<infer TName extends keyof Tables, boolean>
      | Many<infer TName extends keyof Tables>
    ) ?
      TName
    : never
  : never;

type WithRelations<TName extends keyof Tables> = IfThenElse<
  UnionIsEmpty<keyof GetRelationsForTable<TName>>,
  never,
  {
    [Key in keyof GetRelationsForTable<TName>]?:
      | true
      | WithRelations<GetTableNameFromNameAndRelation<TName, Key>>;
  }
>;

type SelectSchema<TTable extends Table> = BuildSchema<
  "select",
  TTable["_"]["columns"],
  undefined,
  CoerceOptions
>;

type SchemaWithRelations<
  TName extends keyof Tables,
  SelectedRelations extends WithRelations<TName>,
> =
  SelectSchema<Tables[TName]> extends z.ZodObject<infer Schema> ?
    z.ZodObject<
      Schema & {
        [Key in keyof SelectedRelations as IfThenElse<
          Extends<undefined, SelectedRelations[Key]>,
          never,
          Key
        >]: Key extends keyof GetRelationsForTable<TName> ?
          GetTableNameFromNameAndRelation<TName, Key> extends (
            infer RTName extends keyof Tables
          ) ?
            z.ZodObject<
              Schema
                & (IfThenElse<
                  Extends<SelectedRelations[Key], object>,
                  SchemaWithRelations<
                    RTName,
                    SelectedRelations[Key] & WithRelations<RTName>
                  >,
                  SelectSchema<Tables[RTName]>
                > extends z.ZodObject<infer ExtendedSchema> ?
                  ExtendedSchema
                : never)
            > extends infer InnerSchema extends z.ZodObject ?
              GetRelationsForTable<TName>[Key] extends (
                One<string, infer IsOptional>
              ) ?
                IfThenElse<IsOptional, z.ZodOptional<InnerSchema>, InnerSchema>
              : GetRelationsForTable<TName>[Key] extends Many<string> ?
                z.ZodArray<InnerSchema>
              : never
            : never
          : never
        : never;
      }
    >
  : never;

export type SchemasFromTable<
  TTable extends Table,
  TName extends keyof Tables = TTable["_"]["name"] & keyof Tables,
> = {
  readonly select: SelectSchema<TTable>;
  readonly insert: BuildSchema<
    "insert",
    TTable["_"]["columns"],
    undefined,
    CoerceOptions
  >;
  readonly update: BuildSchema<
    "update",
    TTable["_"]["columns"],
    undefined,
    CoerceOptions
  >;
  selectWithRelations: <SelectedRelations extends WithRelations<TName>>(
    selectedRelations: SelectedRelations,
  ) => SchemaWithRelations<TName, SelectedRelations>;
};

export function createSchemasFromTable<
  TTable extends Table,
  TName extends keyof Tables = TTable["_"]["name"] & keyof Tables,
>(table: TTable): SchemasFromTable<TTable> {
  const selectSchema = createSelectSchema(table);
  const tableName = table._.name;
  const validRelations =
    tableName in relations ?
      relations[tableName as keyof NicerRelations]
    : undefined;
  return {
    select: createSelectSchema(table),
    insert: createInsertSchema(table),
    update: createUpdateSchema(table),

    selectWithRelations: <SelectedRelations extends WithRelations<TName>>(
      selectedRelations: SelectedRelations,
    ) => {
      if (!validRelations)
        throw new Error(`No relations defined for table "${tableName}"`);
      let selectWithRelationsSchema: z.ZodObject = selectSchema;
      for (const srKey in selectedRelations) {
        if (!(srKey in validRelations.relations))
          throw new Error(
            `No relation "${srKey}" found for table "${tableName}"`,
          );
        const currentRelation = validRelations.relations[
          srKey as keyof typeof validRelations.relations
        ] as Relation<string>;

        const targetTable = currentRelation.targetTable;
        if (!isTable(targetTable))
          throw new Error(
            `No valid target table "${currentRelation.targetTableName}" found for relation "${srKey}" of table "${tableName}"`,
          );

        const currentRelationSchema = createSchemasFromTable(targetTable);
        const nestedSelectedRelations = selectedRelations[srKey];
        const nestedSRKeys =
          typeof nestedSelectedRelations === "object" ?
            Object.keys(nestedSelectedRelations)
          : [];
        const nestedSchema =
          nestedSRKeys.length ?
            currentRelationSchema.selectWithRelations(
              <never>nestedSelectedRelations,
            )
          : currentRelationSchema.select;

        selectWithRelationsSchema = selectWithRelationsSchema.extend({
          [srKey]:
            currentRelation.relationType === "many" ?
              z.array(nestedSchema)
            : nestedSchema,
        });
      }
      return selectWithRelationsSchema as SchemaWithRelations<
        TName,
        SelectedRelations
      >;
    },
  } as SchemasFromTable<TTable>;
}

export type SimplifySchema<
  T extends SchemasFromTable<Table> = SchemasFromTable<Table>,
> = { [Key in keyof T]: T[Key] extends z.ZodObject ? z.infer<T[Key]> : T[Key] };

export type ExtractSelectSchema<T extends SimplifySchema> = T["select"];
export type ExtractInsertSchema<T extends SimplifySchema> = T["insert"];
export type ExtractUpdateSchema<T extends SimplifySchema> = T["update"];
export type ExtractSelectSchemaWithRelations<
  T extends SimplifySchema,
  SelectedRelations extends Parameters<T["selectWithRelations"]>[0],
> =
  T extends SimplifySchema<SchemasFromTable<infer TTable extends Table>> ?
    z.infer<
      SchemaWithRelations<TTable["_"]["name"] & keyof Tables, SelectedRelations>
    >
  : never;

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

const tableBrand = Symbol("tableBrand");
type TableBrand = typeof tableBrand;
export type Schemas<T extends Record<string, Table> = Record<string, Table>> = {
  [Key in keyof T]: BaseSchemaGroup<T[Key]>;
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
    Omit<BaseSchema[Key], keyof Modifications[Key]> & Modifications[Key],
    BaseSchema[Key]
  >;
};

type ModifiedSchemaWithRelations<
  BaseSchema extends ModifiedSchema,
  SchemaRelations extends Record<
    string,
    ExtractTablesWithRelationsParts<any, any>
  >,
> = {
  [Key in keyof BaseSchema]: BaseSchema[Key] & {
    selectWithRelations: <SelectedRelations extends WithRelations<>>(selectedRelations: SelectedRelations) => ;
  };
};

type SchemaModifier<
  BaseSchema extends Schemas,
  Modifications extends Modification<BaseSchema> = {},
> = {
  create: () => ModifiedSchema<BaseSchema, Modifications>;
  modify: <
    MKey extends Exclude<keyof BaseSchema, keyof Modifications>,
    MSchema extends Partial<SchemaGroup>,
  >(
    key: MKey,
    factory: (
      baseSchemas: BaseSchema[MKey],
    ) => Guard<
      Extends<BaseSchema[MKey], MSchema>,
      "Unnecessary modification: Modified schemas are the same as the base schemas",
      MSchema
    >,
  ) => SchemaModifier<BaseSchema, Modifications & Record<MKey, MSchema>>;
};
export function createSchemaModifier<T extends Record<string, Table>>(
  schema: T,
): SchemaModifier<Schemas<T>> {}

const tables = extractTablesFromSchema(schema);
export const schemas = createSchemaModifier(tables)
  .modify("game", (it) => {
    return { insert: z.object({ a: z.string() }) };
  })
  .modify("icon", (it) => ({ ...it }))
  .create();

const t: typeof schemas.game = {};
