import { integer, snakeCase, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/timestamps";

export const icon = snakeCase.table("fagrc_icon", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull().unique(),
  svg: varchar().notNull().unique(),
  ...timestamps,
});
