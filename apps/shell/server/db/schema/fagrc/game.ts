import { integer, snakeCase, varchar } from "drizzle-orm/pg-core";
import { icon } from ".";
import { timestamps } from "../../helpers/timestamps";

export const game = snakeCase.table("fagrc_game", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull().unique(),
  description: varchar().notNull(),
  link: varchar().notNull(),
  wikiLink: varchar(),
  iconId: integer()
    .notNull()
    .references(() => icon.id),
  ...timestamps,
});
