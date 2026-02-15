import { defineRelationsPart } from "drizzle-orm";
import { junctionProcessableRecipe, junctionProcessorRecipe, processable, processor, recipe } from "hub:db:schema";

export const processablesRelations = defineRelationsPart(
  { quantity: junctionProcessableRecipe, processable, recipe },
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
    processable: {
      recipes: r.many.recipe({
        from: r.processable.id.through(r.quantity.processableId),
        to: r.recipe.id.through(r.quantity.recipeId),
      }),
    },
  }),
);

export const recipeProcessorRelation = defineRelationsPart(
  { recipe, processor, junctionProcessorRecipe },
  (r) => ({
    recipe: {
      processedIn: r.many.processor({
        from: r.recipe.id.through(r.junctionProcessorRecipe.recipeId),
        to: r.processor.processableId.through(
          r.junctionProcessorRecipe.processorId,
        ),
      }),
    },
    processor: {
      processes: r.many.recipe({
        from: r.processor.processableId.through(
          r.junctionProcessorRecipe.processorId,
        ),
        to: r.recipe.id.through(r.junctionProcessorRecipe.recipeId),
      }),
    },
  }),
);