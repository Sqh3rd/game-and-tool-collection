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
      v-if="isAnyGameSelected"
      :is-expanded="isModsExpanded"
      :entries="modAndBaseGameEntries"
      title="Mods"
      @select-entry="selectMod"
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

const isAnyGameSelected = computed(() => fagrcStore.currentGame !== undefined);

const gameEntries = computed(() =>
  fagrcStore.games?.map(
    (it): SideMenuIconEntry => ({
      key: it.id,
      isSelected: !!it.isSelected,
      label: it.name,

      icon: optional(it.icon.svg, undefined)
        .filter((it) => !!it)
        .map(parseSimpleSVG)
        .get(),
    }),
  ),
);
const baseGameEntry = computed(
  (): SideMenuIconEntry => ({
    key: -1,
    isSelected: fagrcStore.useBaseGame,
    label: "Base Game",

    icon: undefined,
  }),
);

const mappedMods = computed(() =>
  fagrcStore.mods?.map(
    (it): SideMenuIconEntry => ({
      key: it.id,
      isSelected: !!it.isSelected,
      label: it.name,

      icon: optional(it.icon.svg, undefined)
        .filter((it) => !!it)
        .map(parseSimpleSVG)
        .get(),
    }),
  ),
);

const noModsEntry: SideMenuIconEntry = {
  key: -2,
  isSelected: false,
  disabled: true,
  label: "No mods found",
  icon: "pi-times",
};
const modEntries = computed(() =>
  mappedMods.value?.length ? mappedMods.value : [noModsEntry],
);

const modAndBaseGameEntries = computed(() =>
  mappedMods.value ? [baseGameEntry.value, ...modEntries.value] : undefined,
);

const selectGame = (entry: SideMenuIconEntry) => {
  const game = fagrcStore.games?.find((it) => it.id === entry.key);
  assertNotNull(game);
  const isDifferentGame = fagrcStore.setCurrentGame(game);
  toggleGamesExpanded(false);
  if (!isDifferentGame) return;

  toggleModsExpanded(isDifferentGame);
  fagrcStore.loadMods();
};

const selectMod = (entry: SideMenuIconEntry) => {
  const mod = fagrcStore.mods?.find((it) => it.id === entry.key);
  if (mod) fagrcStore.toggleModSelected(mod);
  else fagrcStore.toggleUseBaseGame();
};
</script>
