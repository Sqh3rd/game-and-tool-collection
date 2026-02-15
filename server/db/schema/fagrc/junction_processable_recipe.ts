import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/timestamps";
import { processable } from "./processable";
import { recipe } from "./recipe";

export const junctionProcessableRecipeType = pgEnum(
  "junction_processable_recipe_type",
  ["IN", "OUT"],
);

export const junctionProcessableRecipe = pgTable(
  "fagrc_junction_processable_recipe",
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
