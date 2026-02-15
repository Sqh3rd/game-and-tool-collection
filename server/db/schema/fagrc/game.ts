import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/timestamps";

export const game = pgTable("fagrc_game", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull().unique(),
  description: varchar().notNull(),
  link: varchar().notNull(),
  wikiLink: varchar(),
  ...timestamps,
});
