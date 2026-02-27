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
type GameSchema = z.infer<typeof gameSchema> & { isCurrentGame?: boolean };
type GamesById = DataGroupedByProperties<GameSchema, ["id"]>;

export const useFagrcStore = defineStore("FAGRC", () => {
  const gamesById = reactive<GamesById>(new Map());
  const games = computed(() => gamesById.values().toArray().flat());

  const currentGame = ref<GameSchema>();

  const loadGames = async () => {
    const loadedGames = await $fetch("/api/fagrc/games", { method: "GET" });
    const parsedGames = z
      .array(dbSchemas.fagrc_game.selectWithRelations({ icon: true }))
      .parse(SuperJSON.parse(loadedGames as unknown as string));

    gamesById.clear();
    parsedGames.forEach((it) => gamesById.set(it.id, [it]));
  };

  const setCurrentGame = (game: GameSchema | undefined) => {
    games.value.forEach((it) => (it.isCurrentGame = false));
    currentGame.value = game;
    if (!game) return;
    game.isCurrentGame = true;
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
    gamesById,
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
