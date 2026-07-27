import {
  integer,
  pgEnum,
  snakeCase,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";
import { recipe } from ".";
import { timestamps } from "../../helpers/timestamps";
import { processable } from "./processable";

export const junctionProcessableRecipeType = pgEnum(
  "fagrc_junction_processable_recipe_type",
  ["IN", "OUT"],
);

export const junctionProcessableRecipe = snakeCase.table(
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
    type: junctionProcessableRecipeType().notNull(),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.recipeId, t.processableId] })],
);
