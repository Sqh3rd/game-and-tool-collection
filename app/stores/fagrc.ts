import { defineStore } from "pinia";
import type {
  Game,
  Mod,
  Processable,
  Processor,
  Recipe,
} from "~~/shared/types/db";

type DataWithLastUpdate<T> = { lastUpdate: Date; data: T };

type GameToDataMap<Data> = Map<number, DataWithLastUpdate<Data>>;

type GameToModToDataMap<Data> = Map<
  number,
  Map<number, DataWithLastUpdate<Data>>
>;

type GMD<Data> = GameToModToDataMap<Data>;

export const useFagrcStore = defineStore("FAGRC", () => {
  const games = ref<Game.Select[]>([]);
  const mods = reactive<GameToDataMap<Mod.Select[]>>(new Map());
  const processables = reactive<GMD<Processable.Select[]>>(new Map());
  const processors = reactive<GMD<Processor.Select[]>>(new Map());
  const recipes = reactive<GMD<Recipe.Select[]>>(new Map());

  const currentGame = ref<Game.Select>();

  const loadGames = async () => {
    games.value = await $fetch("/api/fagrc/games", { method: "GET" });
  };

  const setCurrentGame = (game: Game.Select | undefined) => {
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
