import { index, integer, pgTable, real, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/timestamps";
import { game } from "./game";
import { mod } from "./mod";

export const processable = pgTable(
  "fagrc_processable",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar().notNull().unique(),
    description: varchar().notNull(),
    energyValue: real().notNull().default(0),
    gameId: integer()
      .notNull()
      .references(() => game.id),
    modId: integer().references(() => mod.id),
    ...timestamps,
  },
  (table) => [
    index("game_idx").on(table.gameId),
    index("mod_idx").on(table.modId),
  ],
);
