import { integer, pgEnum, primaryKey, varchar } from "drizzle-orm/pg-core";
import { recipe } from ".";
import { fagrcTable } from "../../helpers/tableCreators";
import { timestamps } from "../../helpers/timestamps";
import { processable } from "./processable";

export const junctionProcessableRecipeType = pgEnum(
  "fagrc_junction_processable_recipe_type",
  ["IN", "OUT"],
);

export const junctionProcessableRecipe = fagrcTable(
  "junction_processable_recipe",
  {
    recipeId: integer()
      .notNull()
      .references(() => recipe.id),
    processableId: integer()
      .notNull()
      .references(() => processable.id),
    quantity: integer().notNull(),
    measurement: varchar().notNull(),
    type: junctionProcessableRecipeType(),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.recipeId, t.processableId] })],
);
