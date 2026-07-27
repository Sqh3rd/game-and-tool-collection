import { snakeCase, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../helpers/timestamps";

export const user = snakeCase.table("user", {
  uuid: uuid().primaryKey().defaultRandom(),
  name: varchar().notNull(),
  email: varchar().notNull().unique(),
  hashedPassword: varchar().notNull(),
  ...timestamps,
});
