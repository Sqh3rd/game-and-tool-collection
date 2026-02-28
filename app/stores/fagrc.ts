import { defineStore } from "pinia";
import z from "zod";

type IsSelected = { isSelected?: boolean };

const gameSchema = dbSchemas.fagrc_game.selectWithRelations({ icon: true });
type GameSchema = z.infer<typeof gameSchema> & IsSelected;
type GamesById = DataGroupedByProperties<GameSchema, ["id"], true>;

const modSchema = dbSchemas.fagrc_mod.selectWithRelations({ icon: true });
type ModSchema = z.infer<typeof modSchema> & IsSelected;
type ModsMap = DataGroupedByProperties<ModSchema, ["gameId", "id"], true>;

const useInternalFagrcStore = defineStore("_fagrc", () => {
  const gamesMap = reactive<GamesById>(new Map());
  const modsMap = reactive<ModsMap>(new Map());

  // Last Updates
  const modsLastUpdateMap = reactive<Map<number, Date>>(new Map());

  return { gamesMap, modsMap, modsLastUpdateMap };
});

const compareLastUpdates = (local: Date, request: string) => {
  const remote = z.date().parse(_parse(request));
  return remote === local;
};

export const useFagrcStore = defineStore("fagrc", () => {
  const _fagrc = useInternalFagrcStore();

  const games = computed(() => _fagrc.gamesMap.values().toArray());

  const currentGame = ref<GameSchema>();

  const mods = computed(
    () =>
      _fagrc.modsMap
        .get(currentGame.value?.id ?? -1)
        ?.values()
        .toArray() ?? [],
  );

  const loadGames = async () => {
    const loadedGames = await $fetch("/api/fagrc/games", { method: "GET" });
    const parsedGames = z.array(gameSchema).parse(_parse(loadedGames));

    _fagrc.gamesMap.clear();
    parsedGames.forEach((it) => _fagrc.gamesMap.set(it.id, it));
  };

  const loadMods = async () => {
    if (!currentGame.value) {
      console.warn("No selected game to load mods for");
      return;
    }
    const { id } = currentGame.value;

    const local = _fagrc.modsLastUpdateMap.get(id);
    const request = await $fetch(`/api/fagrc/${id}/lastUpdate?entity=mod`);
    console.log(local);
    console.log(request);
    if (local && compareLastUpdates(local, request)) return;

    const loadedResult = await $fetch(
      `/api/fagrc/${currentGame.value.id}/mods`,
      { method: "GET" },
    );
    const parsedResult = z
      .object({ data: z.array(modSchema), lastUpdate: z.date() })
      .parse(_parse(loadedResult));

    _fagrc.modsLastUpdateMap.set(id, parsedResult.lastUpdate);

    if (!_fagrc.modsMap.has(id)) _fagrc.modsMap.set(id, new Map());
    const curMods = _fagrc.modsMap.get(id);
    assertNotNull(curMods);

    parsedResult.data.forEach((parsedMod) => {
      curMods.set(parsedMod.id, parsedMod);
    });
  };

  const setCurrentGame = (game: GameSchema | undefined) => {
    const currentGameChanged = currentGame.value !== game;
    games.value.forEach((it) => (it.isSelected = false));
    currentGame.value = game;
    if (!game) return currentGameChanged;
    game.isSelected = true;
    return currentGameChanged;
  };

  return {
    games,
    currentGame,

    mods,

    loadGames,
    loadMods,

    setCurrentGame,
    //    loadMods,
  };
});
