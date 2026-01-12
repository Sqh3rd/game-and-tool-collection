import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../helpers/timestamps";

export const user = pgTable("user", {
  uuid: uuid().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull(),
  email: varchar().notNull().unique(),
  hashedPassword: varchar().notNull(),
  ...timestamps,
});
