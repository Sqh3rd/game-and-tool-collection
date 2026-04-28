<template>
  <SideMenuWithIconEntries
    :is-expanded="isGamesExpanded"
    :entries="games"
    title="Games"
    @select-entry="selectGame"
    @toggle-expanded="toggleGamesExpanded"
  />
</template>

<script setup lang="ts">
import type { SideMenuIconEntry } from "~/components/global/sideMenu/SideMenuWithIconEntries.vue";

const { games } = defineProps<{ games: DBSchema[] }>();

const [isGamesExpanded, toggleGamesExpanded] = useToggle(true);

const selectGame = (entry: SideMenuIconEntry) => {
  const game = fagrcStore.games?.find((it) => it.id === entry.key);
  assertNotNull(game);
  const isDifferentGame = fagrcStore.setCurrentGame(game);
  toggleGamesExpanded(false);
  if (!isDifferentGame) return;

  toggleModsExpanded(isDifferentGame);
  fagrcStore.loadMods();
};
</script>
