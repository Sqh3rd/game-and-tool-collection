import type { db, schema } from "@nuxthub/db";
import { recipe } from "@nuxthub/db/schema";
import type {
  IfThenElse,
  Many,
  One,
  Table,
  TablesRelationalConfig,
} from "drizzle-orm";
import type { drizzle } from "drizzle-orm/postgres-js/driver";
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
type Relations =
  typeof db extends (
    ReturnType<
      typeof drizzle<
        Record<string, unknown>,
        infer Relations extends TablesRelationalConfig
      >
    >
  ) ?
    {
      [Key in keyof Relations as ConvertCase<Key, "camelCase">]: Relations[Key];
    }
  : never;

type GetRelationsForTable<TName extends keyof Tables> = Relations[TName
  & keyof Relations]["relations"];

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
  select: SelectSchema<TTable>;
  insert: BuildSchema<
    "insert",
    TTable["_"]["columns"],
    undefined,
    CoerceOptions
  >;
  update: BuildSchema<
    "update",
    TTable["_"]["columns"],
    undefined,
    CoerceOptions
  >;
  selectWithRelations: <SelectedRelations extends WithRelations<TName>>(
    selectedRelations: SelectedRelations,
  ) => SelectSchema<TTable> & SchemaWithRelations<TName, SelectedRelations>;
};

export function createSchemasFromTable<TTable extends Table>(
  table: TTable,
): SchemasFromTable<TTable> {
  return {
    select: createSelectSchema(table),
    insert: createInsertSchema(table),
    update: createUpdateSchema(table),

    selectWithRelations: ({}) => ({}),
  };
}

const recipeSchemas = createSchemasFromTable(recipe);
const schemaWithRelations = recipeSchemas.selectWithRelations({
  ingredients: { processable: true },
  icon: true,
});

type T = z.infer<typeof schemaWithRelations>;

const test: WithRelations<"icon"> = { a: "" };

const ASchema = z.object({ a: z.string(), b: z.number() });
const BSchema = z.object({ A: ASchema });

type BSchemaType = z.infer<typeof BSchema>;
