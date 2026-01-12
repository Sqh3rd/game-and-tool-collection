import { defineRelations } from "drizzle-orm";
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

export const quantityType = pgEnum("quantity_type", ["IN", "OUT"]);

export const quantity = pgTable(
  "fagrc_quantity",
  {
    recipeId: integer()
      .notNull()
      .references(() => recipe.id),
    processableId: integer()
      .notNull()
      .references(() => recipe.id),
    quantity: integer().notNull(),
    measurement: varchar().notNull(),
    type: quantityType(),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.recipeId, t.processableId] })],
);

export const processablesRelations = defineRelations(
  { quantity, processable, recipe },
  (r) => ({
    recipe: {
      inputs: r.many.quantity({
        from: r.recipe.id,
        to: r.quantity.recipeId,
        where: { type: "IN" },
      }),
      outputs: r.many.quantity({
        from: r.recipe.id,
        to: r.quantity.recipeId,
        where: { type: "OUT" },
      }),
    },
    quantity: {
      processable: r.one.processable({
        from: r.quantity.processableId,
        to: r.processable.id,
      }),
    },
    processable: {
      recipes: r.many.recipe({
        from: r.processable.id.through(r.quantity.processableId),
        to: r.recipe.id.through(r.quantity.recipeId),
      }),
    },
  }),
);
