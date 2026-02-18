import { integer, real } from "drizzle-orm/pg-core";
import { processable } from ".";
import { fagrcTable } from "../../helpers/tableCreators";
import { timestamps } from "../../helpers/timestamps";

export const processor = fagrcTable("processor", {
  processableId: integer()
    .primaryKey()
    .references(() => processable.id),
  energyConsumption: real().notNull(),
  craftingSpeed: real().notNull(),
  ...timestamps,
});
