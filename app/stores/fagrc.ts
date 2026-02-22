import { defineStore } from "pinia";
import type {
  Game,
  Mod,
  Processable,
  Processor,
  Recipe,
} from "~~/shared/types";

type DataWithLastUpdate<T> = { lastUpdate: Date; data: T };

type GD<Data> = Map<number, DataWithLastUpdate<Data>>;

type GameToModToDataMap<Data> = Map<
  number,
  Map<number, DataWithLastUpdate<Data>>
>;

type GMD<Data> = GameToModToDataMap<Data>;

type Games = ExtractSelectSchemaWithRelations<Game, { icon: true }>[];
type Mods = GD<ExtractSelectSchemaWithRelations<Mod, { icon: true }>[]>;
type Processables = GMD<
  ExtractSelectSchemaWithRelations<Processable, { icon: true }>[]
>;
type Processors = GMD<
  ExtractSelectSchemaWithRelations<Processor, { entity: { icon: true } }>[]
>;
type Recipes = GMD<
  ExtractSelectSchemaWithRelations<
    Recipe,
    {
      icon: true;
      ingredients: { processable: { icon: true } };
      processedBy: { processor: { entity: { icon: true } } };
      yield: { processable: { icon: true } };
    }
  >[]
>;

export const useFagrcStore = defineStore("FAGRC", () => {
  const games = ref<Games>([]);
  const mods = reactive<Mods>(new Map());
  const processables = reactive<Processables>(new Map());
  const processors = reactive<Processors>(new Map());
  const recipes = reactive<Recipes>(new Map());

  const currentGame = ref<ExtractSelectSchema<Game>>();

  const loadGames = async () => {
    games.value = await $fetch("/api/fagrc/games", { method: "GET" });
  };

  const setCurrentGame = (game: ExtractSelectSchema<Game> | undefined) => {
    currentGame.value = game;
    if (!game) return;
    const { id } = game;
    if (!processables.has(id)) processables.set(id, new Map());
    if (!processors.has(id)) processors.set(id, new Map());
    if (!recipes.has(id)) recipes.set(id, new Map());
  };

  const loadMods = async () => {
    if (!currentGame.value) return;
    const gameId = currentGame.value.id;
    mods.set(
      gameId,
      await $fetch(`/api/fagrc/${gameId}/mods`, { method: "GET" }),
    );
  };

  return {
    games,
    currentGame,
    mods,
    processables,
    processors,
    recipes,
    loadGames,
    setCurrentGame,
    loadMods,
  };
});
