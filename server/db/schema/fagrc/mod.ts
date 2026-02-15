import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/timestamps";
import { game } from "./game";

export const mod = pgTable("fagrc_mod", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull().unique(),
  description: varchar(),
  link: varchar().notNull(),
  gameId: integer()
    .notNull()
    .references(() => game.id),
  ...timestamps,
});
