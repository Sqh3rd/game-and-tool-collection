import { defineRelationsPart, type Table } from "drizzle-orm";
import { snakeCase, uuid, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/zod";
import { describe, expect, test } from "vitest";
import * as z from "zod";
import { getKeys } from "../../../shared/utils/objectUtils";
import { schemaModifier } from "../../../../../packages/schemaModifier/src/lib/schema-modifier";

describe("createZodSchemasFromDBSchema", () => {
  const user = snakeCase.table("user", {
    uuid: uuid().primaryKey().defaultRandom(),
    name: varchar().notNull(),
  });
  const role = snakeCase.table("role", {
    uuid: uuid().primaryKey().defaultRandom(),
    name: varchar().notNull(),
  });
  const userRoleJunction = snakeCase.table("userRoleJunction", {
    userUuid: uuid().references(() => user.uuid),
    roleUuid: uuid().references(() => role.uuid),
  });
  const dbSchema = { user, role, userRoleJunction };

  const userRoleRelations = defineRelationsPart(
    { user, role, userRoleJunction },
    (r) => ({
      user: {
        roles: r.many.role({
          from: r.user.uuid.through(r.userRoleJunction.userUuid),
          to: r.role.uuid.through(r.userRoleJunction.roleUuid),
        }),
      },
    }),
  );
  const relations = { ...defineRelationsPart(dbSchema), ...userRoleRelations };

  const schemaToString = (schema: z.ZodObject) => JSON.stringify(schema.shape);

  const createSchemaOfType = {
    insert: createInsertSchema,
    select: createSelectSchema,
    update: createUpdateSchema,
  } as Record<"insert" | "select" | "update", (table: Table) => z.ZodObject>;

  const testBaseSchema = (
    baseSchema: Record<
      keyof typeof dbSchema,
      Record<"insert" | "select" | "update", z.ZodObject>
    >,
  ) => {
    getKeys(dbSchema).forEach((tableName) => {
      getKeys(createSchemaOfType).forEach((schemaType) => {
        const actual = baseSchema[tableName][schemaType];
        const expected = createSchemaOfType[schemaType](dbSchema[tableName]);

        expect(schemaToString(actual)).toEqual(schemaToString(expected));
      });
    });
  };

  test("Base schema", () => {
    testBaseSchema(schemaModifier(dbSchema).create());
  });

  test("Base schema with relations", () => {
    testBaseSchema(schemaModifier(dbSchema).withRelations(relations).create());
  });

  test("Base schema with relations differs from plain base schema", () => {
    const baseSchema = schemaModifier(dbSchema).create();
    const baseSchemaWithRelations = schemaModifier(dbSchema)
      .withRelations(relations)
      .create();

    expect(getKeys(baseSchemaWithRelations)).toEqual(getKeys(baseSchema));

    getKeys(baseSchema).forEach((tableName) => {
      expect(getKeys(baseSchemaWithRelations[tableName])).toContain(
        getKeys(baseSchema),
      );
      getKeys(baseSchema[tableName]).forEach((schemaType) => {
        expect(
          schemaToString(baseSchemaWithRelations[tableName][schemaType]),
        ).toEqual(schemaToString(baseSchema[tableName][schemaType]));
        expect(
          getKeys(baseSchemaWithRelations[tableName][schemaType]),
        ).toContain("selectWithRelations");
      });
    });
  });

  test("Base schema with modifications", () => {
    const baseSchema = schemaModifier(dbSchema)
      .modify("role", ({ insert }) => ({ insert: insert.omit({ uuid: true }) }))
      .create();

    // User schema should be a base schema
    getKeys(createSchemaOfType).forEach((schemaType) => {
      expect(schemaToString(baseSchema.user[schemaType])).toEqual(
        createSchemaOfType[schemaType](user),
      );
    });

    // Role schema should be a base schema with the exception of insert
    getKeys(createSchemaOfType)
      .filter((it) => it !== "insert")
      .forEach((schemaType) => {
        expect(schemaToString(baseSchema.role[schemaType])).toEqual(
          createSchemaOfType[schemaType](role),
        );
      });

    expect(schemaToString(baseSchema.role.insert)).toEqual(
      createInsertSchema(role).omit({ uuid: true }),
    );
  });

  test("Schema properly extends withSelected", () => {
    const baseSchema = schemaModifier(dbSchema)
      .withRelations(relations)
      .create();

    const actual = baseSchema.user.selectWith({ roles: true });
    const expected = createSelectSchema(user).extend({
      roles: z.array(createSelectSchema(role)),
    });
    expect(schemaToString(actual)).toEqual(schemaToString(expected));
  });
});
