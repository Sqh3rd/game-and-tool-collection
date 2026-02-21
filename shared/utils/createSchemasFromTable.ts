import { relations, type Relations, type schema } from "@nuxthub/db";
import {
  isTable,
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
import type { ConvertCase, Extends, UnionIsEmpty } from "./helperTypes";

type Schema = typeof schema;
type Tables = {
  [Key in keyof Schema as Schema[Key] extends infer TTable extends Table ?
    ConvertCase<TTable["_"]["name"], "camelCase">
  : never]: Schema[Key];
};
type NicerRelations = {
  [Key in keyof Relations as ConvertCase<Key, "camelCase">]: Relations[Key];
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
        >]: GetTableNameFromNameAndRelation<
          TName,
          Key & keyof GetRelationsForTable<TName>
        > extends infer RTName extends keyof Tables ?
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
          >
        : never;
      }
    >
  : never;

export type SchemasFromTable<
  TTable extends Table,
  TName extends keyof Tables = TTable["_"]["name"] & keyof Tables,
> = {
  _: { table: TTable };
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

type GetTableNameFromSchemas<T extends SchemasFromTable<Table>> =
  T["_"]["table"]["_"]["name"] & keyof Tables;
export type GetSelectSchema<T extends SchemasFromTable<Table>> = T["select"];
export type GetInsertSchema<T extends SchemasFromTable<Table>> = T["insert"];
export type GetUpdateSchema<T extends SchemasFromTable<Table>> = T["update"];
export type GetSelectSchemaWithRelations<
  T extends SchemasFromTable<Table>,
  SelectedRelations extends WithRelations<GetTableNameFromSchemas<T>>,
> = SchemaWithRelations<GetTableNameFromSchemas<T>, SelectedRelations>;
