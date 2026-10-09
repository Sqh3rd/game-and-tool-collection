import { defineRelations, extractTablesFromSchema } from "drizzle-orm";
import { serial, snakeCase, text, timestamp } from "drizzle-orm/pg-core";
import { schemaModifier } from "./schema-modifier";

const user = snakeCase.table("user", {
  id: serial().primaryKey(),
  name: text(),
  createdAt: timestamp(),
  updatedAt: timestamp(),
});
const role = snakeCase.table("role", {
  id: serial().primaryKey(),
  name: text(),
  createdAt: timestamp(),
  updatedAt: timestamp(),
});
const userRoleJunction = snakeCase.table("userRoleJunction", {
  userId: serial().references(() => user.id),
  roleId: serial().references(() => role.id),
});
const userRoleRelation = defineRelations(
  { user, role, userRoleJunction },
  (r) => ({
    user: {
      roles: r.many.role({
        to: r.user.id.through(r.userRoleJunction.userId),
        from: r.role.id.through(r.userRoleJunction.roleId),
      }),
    },
  }),
);
const schema = { user, role, userRoleJunction, userRoleRelation };
describe("Simple Schema", () => {
  const modifiedSchema = schemaModifier(
    "zod",
    extractTablesFromSchema(schema),
  ).create();
});
