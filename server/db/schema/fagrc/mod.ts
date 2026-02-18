import { integer, varchar } from "drizzle-orm/pg-core";
import { game, icon } from ".";
import { fagrcTable } from "../../helpers/tableCreators";
import { timestamps } from "../../helpers/timestamps";

export const mod = fagrcTable("mod", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull().unique(),
  description: varchar(),
  link: varchar().notNull(),
  gameId: integer()
    .notNull()
    .references(() => game.id),
  iconId: integer().references(() => icon.id),
  ...timestamps,
});
