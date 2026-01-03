import { integer, pgTable, varchar, type PgColumnBuilderBase } from "drizzle-orm/pg-core";
import type { User } from "~/shared/common/user";

export const userTable = pgTable<"users", Record<keyof User, PgColumnBuilderBase>>("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique()
})