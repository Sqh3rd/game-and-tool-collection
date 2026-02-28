<template>
  <div class="size-full flex flex-row">
    <SideMenuWithIconEntries
      :is-expanded="isGamesExpanded"
      :entries="gameEntries"
      title="Games"
      @select-entry="selectGame"
      @toggle-expanded="toggleGamesExpanded"
    />
    <SideMenuWithIconEntries
      :is-expanded="isModsExpanded"
      :entries="modEntries"
      title="Mods"
      @toggle-expanded="toggleModsExpanded"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
import SideMenuWithIconEntries, {
  type SideMenuIconEntry,
} from "~/components/global/sideMenu/SideMenuWithIconEntries.vue";

const [isGamesExpanded, toggleGamesExpanded] = useToggle(true);
const [isModsExpanded, toggleModsExpanded] = useToggle(true);

const fagrcStore = useFagrcStore();
const spinnerStore = useSpinnerStore();

const games = fagrcStore.games;
const gameEntries = computed((): SideMenuIconEntry[] =>
  games.map((it) => ({
    key: it.id,
    isSelected: !!it.isSelected,
    label: it.name,

    icon: optional(it.icon.svg, undefined)
      .filter((it) => !!it)
      .map(parseSimpleSVG)
      .get(),
  })),
);
const mods = fagrcStore.mods;
const modEntries = computed((): SideMenuIconEntry[] =>
  mods.map((it) => ({
    key: it.id,
    isSelected: !!it.isSelected,
    label: it.name,

    icon: optional(it.icon.svg, undefined)
      .filter((it) => !!it)
      .map(parseSimpleSVG)
      .get(),
  })),
);
watch(games, () => console.log("Games changed"));
watch(gameEntries, () => console.log("Game entries changed"));

const selectGame = (entry: SideMenuIconEntry) => {
  const game = games.find((it) => it.id === entry.key);
  assertNotNull(game);
  const isDifferentGame = fagrcStore.setCurrentGame(game);
  toggleGamesExpanded(false);
  if (!isDifferentGame) return;

  toggleModsExpanded(isDifferentGame);
  spinnerStore.load(fagrcStore.loadMods());
};
</script>
