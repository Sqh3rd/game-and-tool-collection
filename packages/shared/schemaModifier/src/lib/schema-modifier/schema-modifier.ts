import {
  getEntries,
  getKeys,
  modificationPipe,
  optional,
  type ModificationPipe,
} from "@gatc/utils";
import { StandardSchemaV1 } from "@standard-schema/spec";
import {
  getTableName,
  isTable,
  type AnyRelationsBuilderConfig,
  type ExtractTablesWithRelationsParts,
  type One,
  type Relation,
  type Table,
} from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/zod";
import { StandardSchemaAdapter } from "../standard-schema-adapter/standard-schema-adapter.types";
import {
  SchemaGroup,
  SchemaModifier,
  SimpleSchemaModifier,
} from "./schema-modifier.types";

const createBaseSchemaGroup = (table: Table) => ({
  insert: createInsertSchema(table),
  select: createSelectSchema(table),
  update: createUpdateSchema(table),
});

const selectWithRelations =
  (
    modifiedSchema: Record<string, SchemaGroup>,
    relations: Record<string, Record<string, Relation>>,
    currentEntry: string,
    adapter: StandardSchemaAdapter<StandardSchemaV1, StandardSchemaV1<object>>,
  ) =>
  (selectedRelations: Record<string, unknown>): StandardSchemaV1<object> => {
    if (!(currentEntry in modifiedSchema)) throw new Error("Invalid key");
    let selectWithRelationSchema = modifiedSchema[currentEntry].select;
    for (const key in selectedRelations) {
      const cur = selectedRelations[key];
      if (
        !cur
        || !(currentEntry in relations)
        || !(key in relations[currentEntry])
      )
        continue;
      const currentRelation = relations[currentEntry][key];
      if (!isTable(currentRelation.targetTable))
        throw new Error("Relation target is not a table");
      const target = getTableName(currentRelation.targetTable);
      if (!(target in modifiedSchema))
        throw new Error("Relation target not found in source schema");

      const innerSchema =
        typeof selectedRelations[key] === "object" ?
          selectWithRelations(
            modifiedSchema,
            relations,
            target,
            adapter,
          )(selectedRelations[key] as Record<string, unknown>)
        : modifiedSchema[target].select;

      const inner =
        currentRelation.relationType === "one" ?
          (<One<string>>currentRelation).optional ?
            adapter.optional(innerSchema)
          : innerSchema
        : adapter.array(innerSchema);

      selectWithRelationSchema = { ...selectWithRelationSchema, [key]: inner };
    }
    return selectWithRelationSchema;
  };

const createModifiedSchema = (
  schema: Record<string, Table>,
  modifications: Record<string, ModificationPipe<SchemaGroup>>,
  adapter: StandardSchemaAdapter<StandardSchemaV1, StandardSchemaV1<object>>,
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
          ...modifications[key](baseSchemaGroup),
        },
      };
    })
    .reduce((prev, cur) => ({ ...prev, ...cur }), {});
  if (!relations) return modifiedSchema;

  const modifiedSchemaWithRelations: Record<
    string,
    SchemaGroup & {
      selectWith?: (relations: Record<string, unknown>) => StandardSchemaV1;
    }
  > = modifiedSchema;

  const relationsByTableName: Record<string, Record<string, Relation>> = {};

  for (const key in relations) {
    const cur = relations[key];
    const schemaEntry = modifiedSchemaWithRelations[getTableName(cur.table)];
    relationsByTableName[getTableName(cur.table)] = cur.relations;
    schemaEntry.selectWith = selectWithRelations(
      modifiedSchema,
      relationsByTableName,
      key,
      adapter,
    );
  }

  return modifiedSchema;
};

const internalSchemaModifier = (
  adapter: StandardSchemaAdapter<StandardSchemaV1, StandardSchemaV1<object>>,
  schema: Record<string, Table>,
  modifications: Record<string, ModificationPipe<SchemaGroup>>,
  modificationsUnited: Record<string, ModificationPipe<StandardSchemaV1>>,
  relations?: ExtractTablesWithRelationsParts<
    AnyRelationsBuilderConfig,
    Record<string, Table>
  >,
): SimpleSchemaModifier => ({
  create: () => createModifiedSchema(schema, modifications, adapter, relations),
  modify: (key, factory) =>
    internalSchemaModifier(
      adapter,
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
      adapter,
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
      adapter,
      schema,
      getEntries(modifications)
        .map(([key, value]) => ({ [key]: value.func(factory) }))
        .reduce((prev, cur) => ({ ...prev, ...cur }), {}),
      modificationsUnited,
      relations,
    ),
  withRelations: (newRelations) =>
    internalSchemaModifier(
      adapter,
      schema,
      modifications,
      modificationsUnited,
      newRelations,
    ),
});

export const schemaModifier = <
  TBaseSchema extends StandardSchemaV1,
  TObjectSchema extends StandardSchemaV1<object>,
  T extends Record<string, Table>,
>(
  adapter: StandardSchemaAdapter<TBaseSchema, TObjectSchema>,
  schema: T,
): SchemaModifier<TObjectSchema, T> =>
  internalSchemaModifier(
    adapter as unknown as StandardSchemaAdapter<
      StandardSchemaV1,
      StandardSchemaV1<object>
    >,
    schema,
    getKeys(schema)
      .map((key) => ({ [key]: modificationPipe<SchemaGroup>() }))
      .reduce((prev, cur) => ({ ...prev, ...cur }), {}),
    getKeys(schema)
      .map((key) => ({ [key]: modificationPipe<StandardSchemaV1>() }))
      .reduce((prev, cur) => ({ ...prev, ...cur }), {}),
  ) as unknown as SchemaModifier<TObjectSchema, T>;
