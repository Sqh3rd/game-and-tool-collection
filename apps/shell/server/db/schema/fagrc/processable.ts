import { index, integer, snakeCase, real, varchar } from "drizzle-orm/pg-core";
import { icon, mod } from ".";
import { timestamps } from "../../helpers/timestamps";

export const processable = snakeCase.table(
  "fagrc_processable",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar().notNull().unique(),
    description: varchar().notNull(),
    energyValue: real().notNull().default(0),
    modId: integer().references(() => mod.id),
    iconId: integer()
      .notNull()
      .references(() => icon.id),
    ...timestamps,
  },
  (table) => [index().on(table.modId)],
);
