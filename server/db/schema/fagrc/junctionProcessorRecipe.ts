import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { processor, recipe } from ".";
import { timestamps } from "../../helpers/timestamps";

export const junctionProcessorRecipe = pgTable(
  "fagrc_junction_processor_recipe",
  {
    recipeId: integer()
      .notNull()
      .references(() => recipe.id),
    processorId: integer()
      .notNull()
      .references(() => processor.processableId),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.recipeId, t.processorId] })],
);
