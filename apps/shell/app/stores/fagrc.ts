import { defineStore } from "pinia";
import z from "zod";

type IsSelected = { isSelected?: boolean };

const gameSchema = dbSchemas.fagrc_game.selectWith({ icon: true });
type GameSchema = z.infer<typeof gameSchema> & IsSelected;

const modSchema = dbSchemas.fagrc_mod.selectWith({ icon: true });
type ModSchema = z.infer<typeof modSchema> & IsSelected;
type ModsByGame = DataGroupedByProperties<ModSchema, ["gameId"]>;

const recipeSchema = dbSchemas.fagrc_recipe.selectWith({ icon: true });
export type RecipeSchema = z.infer<typeof recipeSchema>;
//type RecipesByMod = DataGroupedByProperties<RecipeSchema, [""]>;

const compareLastUpdates = (local: Date, request: string) => {
  const remote = z.date().parse(_parse(request));
  console.log(local, remote, remote.getTime() === local.getTime());
  return remote.getTime() === local.getTime();
};

export const useFagrcStore = defineStore("fagrc", () => {
  const games = ref<GameSchema[]>();
  const currentGame = ref<GameSchema>();

  const _modsByGame = reactive<ModsByGame>(new Map());
  const _modsLastUpdateMap = reactive<Map<number, Date>>(new Map());

  const mods = computed(() => _modsByGame.get(currentGame.value?.id ?? -1));
  const [useBaseGame, toggleUseBaseGame] = useToggle(true);

  const loadGames = async () => {
    games.value = undefined;
    const loadedGames = await $fetch("/api/fagrc/games", { method: "GET" });
    const parsedGames = z.array(gameSchema).parse(_parse(loadedGames));

    games.value = [...parsedGames];
  };

  const loadMods = async () => {
    if (!currentGame.value) {
      console.warn("No selected game to load mods for");
      return;
    }
    const { id } = currentGame.value;

    const local = _modsLastUpdateMap.get(id);
    const request = await $fetch(`/api/fagrc/${id}/lastUpdate?entity=mod`);
    if (local && compareLastUpdates(local, request)) return;

    _modsByGame.delete(id);

    const loadedResult = await $fetch(
      `/api/fagrc/${currentGame.value.id}/mods`,
      { method: "GET" },
    );
    const parsedResult = z
      .object({ data: z.array(modSchema), lastUpdate: z.date() })
      .parse(_parse(loadedResult));

    _modsLastUpdateMap.set(id, parsedResult.lastUpdate);

    _modsByGame.set(
      id,
      parsedResult.data.map((it) => ({ ...it, isSelected: it.baseGame })),
    );
  };

  const loadRecipes = async () => {
    if (
      !currentGame.value
      || !_modsByGame.get(currentGame.value.id)?.some((it) => it.isSelected)
    ) {
      console.warn("No selected game or selected mods to load recipes for");
      return;
    }
  };

  const setCurrentGame = (game: GameSchema | undefined) => {
    const currentGameChanged = currentGame.value !== game;
    games.value?.forEach((it) => (it.isSelected = false));
    currentGame.value = game;
    if (!game) return currentGameChanged;
    game.isSelected = true;
    return currentGameChanged;
  };

  const toggleModSelected = (mod: ModSchema, val?: boolean) => {
    if (val !== undefined) mod.isSelected = val;
    else mod.isSelected = !mod.isSelected;
  };

  return {
    games,
    currentGame,

    mods,
    useBaseGame,

    loadGames,
    loadMods,

    setCurrentGame,
    toggleModSelected,
    toggleUseBaseGame,
    //    loadMods,

    _modsByGame,
    _modsLastUpdateMap,
  };
});
