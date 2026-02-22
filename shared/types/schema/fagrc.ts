import {
  game,
  icon,
  mod,
  processable,
  processor,
  recipe,
} from "@nuxthub/db/schema";
import type {
  SimplifySchema
} from "~~/shared/utils/createSchemasFromTable";

export const iconSchemas = createSchemasFromTable(icon);
export type Icon = SimplifySchema<typeof iconSchemas>;

export const gameSchemas = createSchemasFromTable(game);
export type Game = SimplifySchema<typeof gameSchemas>;

export const modSchemas = createSchemasFromTable(mod);
export type Mod = SimplifySchema<typeof modSchemas>;

export const processableSchemas = createSchemasFromTable(processable);
export type Processable = SimplifySchema<typeof processableSchemas>;

export const recipeSchemas = createSchemasFromTable(recipe);
export type Recipe = SimplifySchema<typeof recipeSchemas>;

export const processorSchemas = createSchemasFromTable(processor);
export type Processor = SimplifySchema<typeof processorSchemas>;
