import { defineRelationsPart } from "drizzle-orm";
import {
  game,
  icon,
  junctionProcessableRecipe,
  junctionProcessorRecipe,
  mod,
  processable,
  processor,
  recipe,
} from ".";

export const fagrcRelations = defineRelationsPart(
  {
    game,
    icon,
    junctionProcessableRecipe,
    junctionProcessorRecipe,
    mod,
    processable,
    processor,
    recipe,
  },
  (r) => ({
    game: { icon: r.one.icon({ from: r.game.iconId, to: r.icon.id }) },

    junctionProcessorRecipe: {
      processor: r.one.processor({
        from: r.junctionProcessorRecipe.processorId,
        to: r.processor.processableId,
      }),
    },

    junctionProcessableRecipe: {
      processable: r.one.processable({
        from: r.junctionProcessableRecipe.processableId,
        to: r.processable.id,
      }),
    },

    mod: { icon: r.one.icon({ from: r.mod.iconId, to: r.icon.id }) },

    processable: {
      icon: r.one.icon({ from: r.processable.iconId, to: r.icon.id }),
    },

    processor: {
      entity: r.one.processable({
        from: r.processor.processableId,
        to: r.processable.id,
      }),
    },

    recipe: {
      ingredients: r.many.junctionProcessableRecipe({
        from: r.recipe.id,
        to: r.junctionProcessableRecipe.recipeId,
        where: { type: "IN" },
      }),
      yield: r.many.junctionProcessableRecipe({
        from: r.recipe.id,
        to: r.junctionProcessableRecipe.recipeId,
        where: { type: "OUT" },
      }),
      processedBy: r.many.junctionProcessorRecipe({
        from: r.recipe.id,
        to: r.junctionProcessorRecipe.recipeId,
      }),
      icon: r.one.icon({ from: r.recipe.iconId, to: r.icon.id }),
    },
  }),
);
