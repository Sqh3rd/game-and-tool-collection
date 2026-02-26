import { defineStore } from "pinia";
import { SuperJSON } from "superjson";
import z from "zod";

type DataWithLastUpdate<T> = { lastUpdate: Date; data: T };

type GD<Data> = Map<number, DataWithLastUpdate<Data>>;

type GameToModToDataMap<Data> = Map<
  number,
  Map<number, DataWithLastUpdate<Data>>
>;

type GMD<Data> = GameToModToDataMap<Data>;

const gameSchema = dbSchemas.fagrc_game.selectWithRelations({ icon: true });
type GameSchema = z.infer<typeof gameSchema>;

export const useFagrcStore = defineStore("FAGRC", () => {
  const games = ref<GameSchema[]>([]);

  const currentGame = ref<SelectSchema["fagrc_game"]>();

  const loadGames = async () => {
    const loadedGames = await $fetch("/api/fagrc/games", { method: "GET" });
    games.value = z
      .array(dbSchemas.fagrc_game.selectWithRelations({icon: true}))
      .parse(SuperJSON.parse(loadedGames as unknown as string));
  };

  const setCurrentGame = (game: SelectSchema["fagrc_game"] | undefined) => {
    currentGame.value = game;
    if (!game) return;
    const { id } = game;
  };

//  const loadMods = async () => {
//    if (!currentGame.value) return;
//    const gameId = currentGame.value.id;
//    mods.set(
//      gameId,
//      await $fetch(`/api/fagrc/${gameId}/mods`, { method: "GET" }),
//    );
//  };

  return {
    games,
    currentGame,
//    mods,
//    processables,
//    processors,
//    recipes,
    loadGames,
    setCurrentGame,
//    loadMods,
  };
});
