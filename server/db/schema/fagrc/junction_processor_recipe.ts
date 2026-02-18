import { integer, primaryKey } from "drizzle-orm/pg-core";
import { processor, recipe } from ".";
import { fagrcTable } from "../../helpers/tableCreators";
import { timestamps } from "../../helpers/timestamps";

export const junctionProcessorRecipe = fagrcTable(
  "junction_processor_recipe",
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
