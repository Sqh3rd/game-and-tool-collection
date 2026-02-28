import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { game, icon } from ".";
import { timestamps } from "../../helpers/timestamps";

export const mod = pgTable("fagrc_mod", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull().unique(),
  description: varchar(),
  link: varchar().notNull(),
  gameId: integer()
    .notNull()
    .references(() => game.id),
  iconId: integer()
    .notNull()
    .references(() => icon.id),
  ...timestamps,
});
