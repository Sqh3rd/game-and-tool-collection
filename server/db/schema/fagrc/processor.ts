import { defineRelations } from "drizzle-orm";
import { integer, pgTable, real } from "drizzle-orm/pg-core";
import { processable } from "hub:db:schema";
import { timestamps } from "../../helpers/timestamps";

export const processor = pgTable("fagrc_processor", {
  processableId: integer()
    .primaryKey()
    .references(() => processable.id),
  energyConsumption: real().notNull(),
  craftingSpeed: real().notNull(),
  ...timestamps,
});

export const processorRelations = defineRelations(
  { processor, processable },
  (r) => ({
    processor: {
      entity: r.one.processable({
        from: r.processor.processableId,
        to: r.processable.id,
      }),
    },
  }),
);
