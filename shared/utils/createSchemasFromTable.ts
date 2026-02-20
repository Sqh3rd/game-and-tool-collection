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
import type { ConvertCase, UnionIsEmpty } from "./helperTypes";

type Schema = typeof schema;
type Tables = {
  [Key in keyof Schema as Schema[Key] extends infer TTable extends Table ?
    TTable["_"]["name"]
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
    Relations
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

type Test = GetTableNameFromNameAndRelation<"recipe", "ingredients">;
type Test2 =
  GetRelationsForTable<"recipe">["ingredients"] extends Many<infer TName> ?
    ConvertCase<TName, "snake_case">
  : never;
type Test3 = keyof Tables;

type WithRelations<TName extends keyof Tables> = IfThenElse<
  UnionIsEmpty<keyof GetRelationsForTable<TName>>,
  never,
  { [Key in keyof GetRelationsForTable<TName>]?: true }
>;

type SelectWithRelationsHelper<TName extends keyof Tables> = IfThenElse<
  UnionIsEmpty<keyof GetRelationsForTable<TName>>,
  never,
  "selectWithRelations"
>;

export type SchemasFromTable<
  TTable extends Table,
  TName extends keyof Tables = TTable["_"]["name"] & keyof Tables,
> = {
  select: BuildSchema<
    "select",
    TTable["_"]["columns"],
    undefined,
    CoerceOptions
  >;
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
} & {
  [Key in SelectWithRelationsHelper<TName>]: <
    SelectedRelations extends WithRelations<TName>,
  >(
    selectedRelations: SelectedRelations,
  ) => object;
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
recipeSchemas.selectWithRelations({ ingredients: {}, icon: false });

const test: WithRelations<"icon"> = { a: "" };
