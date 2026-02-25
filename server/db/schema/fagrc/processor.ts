import { integer, pgTable, real } from "drizzle-orm/pg-core";
import { processable } from ".";
import { timestamps } from "../../helpers/timestamps";

export const processor = pgTable("fagrc_processor", {
  processableId: integer()
    .primaryKey()
    .references(() => processable.id),
  energyConsumption: real().notNull(),
  craftingSpeed: real().notNull(),
  ...timestamps,
});
