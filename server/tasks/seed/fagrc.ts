import type {
  PgInsertValue,
  PgTableWithColumns,
  TableConfig,
} from "drizzle-orm/pg-core";
import {
  game,
  junctionProcessorRecipe,
  mod,
  processable,
  processor,
  recipe,
} from "hub:db:schema";
import { junctionProcessableRecipe } from "~~/server/db/schema/fagrc";
import type {
  JunctionProcessableRecipe,
  JunctionProcessorRecipe,
} from "~~/server/utils/types";
import type {
  Game,
  Mod,
  Processable,
  Processor,
  Recipe,
} from "~~/shared/types/db";

const insert = <T extends TableConfig>(it: {
  table: PgTableWithColumns<T>;
  data: PgInsertValue<PgTableWithColumns<NoInfer<T>>>[];
  name: string;
}) => it;

export default defineTask({
  meta: {
    name: "db:seed:fagrc",
    description: "Seed database with initial fagrc data",
  },
  async run() {
    const inserts = [
      insert({ table: game, data: initialGames, name: "Game" }),
      insert({ table: mod, data: initialMods, name: "Mod" }),
      insert({
        table: processable,
        data: initialProcessables,
        name: "Processable",
      }),
      insert({ table: recipe, data: initialRecipes, name: "Recipe" }),
      insert({ table: processor, data: initialProcessors, name: "Processor" }),
      insert({
        table: junctionProcessorRecipe,
        data: initialJunctionProcessorRecipe,
        name: "JunctionProcessorRecipe",
      }),
      insert({
        table: junctionProcessableRecipe,
        data: initialJunctionProcessableRecipe,
        name: "JunctionProcessableRecipe",
      }),
    ];

    for (const it of inserts) {
      console.log(`Inserting entries into table '${it.name}'`);
      const start = new Date();
      const result = (
        await db.insert(it.table).values(it.data).onConflictDoNothing()
      ).length;
      console.log(
        `Successfully inserted ${result} rows in ${new Date().getMilliseconds() - start.getMilliseconds()}ms`,
      );
    }
    return { result: "Database seeded successfully" };
  },
});

const initialGames: Game.Insert[] = [
  {
    name: "Factorio",
    description: "You know what it is",
    link: "https://factorio.com/",
    wikiLink: "https://wiki.factorio.com/",
  },
  {
    name: "Dyson Sphere Program",
    description: "DSP",
    link: "https://store.steampowered.com/app/1366540/Dyson_Sphere_Program/",
  },
  { name: "Desynced", description: "", link: "https://www.desyncedgame.com/" },
  {
    name: "Satisfactory",
    description: "",
    link: "https://www.satisfactorygame.com/",
  },
];

const initialMods: Mod.Insert[] = [
  {
    gameId: 1,
    name: "Space Age",
    link: "http://factorio.com/space-age/overview",
    description: "Official Factorio DLC",
  },
];

const initialProcessables: Processable.Insert[] = [
  { name: "Stone furnace", description: "Basic furnace", gameId: 1 },
  {
    name: "Iron Ore",
    description: "One of the most basic resources",
    gameId: 1,
  },
  {
    name: "Copper Ore",
    description: "One of the most basic resources",
    gameId: 1,
  },
  {
    name: "Iron plate",
    description: "One of the most basic resources",
    gameId: 1,
  },
  { name: "Stone", description: "One of the most basic resources", gameId: 1 },
  { name: "Coal", description: "Basic fuel", gameId: 1, energyValue: 4e6 },
];

const initialRecipes: Recipe.Insert[] = [{ duration: 0.5 }];

const initialProcessors: Processor.Insert[] = [
  { processableId: 1, energyConsumption: 90e3, craftingSpeed: 1 },
];

const initialJunctionProcessorRecipe: JunctionProcessorRecipe.Insert[] = [
  { processorId: 1, recipeId: 1 },
];
const initialJunctionProcessableRecipe: JunctionProcessableRecipe.Insert[] = [
  {
    processableId: 1,
    recipeId: 1,
    quantity: 1,
    measurement: "pcs",
    type: "OUT",
  },
  {
    processableId: 5,
    recipeId: 1,
    quantity: 5,
    measurement: "pcs",
    type: "IN",
  },
];
