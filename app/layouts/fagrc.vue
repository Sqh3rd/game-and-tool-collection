<template>
  <div class="size-full">
    <SideMenu :is-expanded="!!isExpanded">
      <template #title>
        <div class="flex flex-row items-center h-5">
          <span
            v-if="isExpanded"
            class="text-lg font-semibold"
            >Games</span
          >
          <div class="grow" />
          <i
            v-if="isExpanded"
            class="pi pi-angle-double-left cursor-pointer"
            @click.prevent="toggleExpanded()"
          />
          <i
            v-else
            class="pi pi-angle-double-right cursor-pointer"
            @click.prevent="toggleExpanded()"
          />
        </div>
      </template>
      <template #content>
        <SideMenuEntry
          v-for="game of games"
          :key="game.name"
          :expanded="isExpanded"
          :label="game.name"
          @click.prevent="selectGame(game)"
        />
      </template>
    </SideMenu>
    <slot />
  </div>
</template>

<script setup lang="ts">
import SideMenu from "~/components/global/sideMenu/SideMenu.vue";
import SideMenuEntry from "~/components/global/sideMenu/SideMenuEntry.vue";
import type { Game } from "~~/shared/types/db";

const [isExpanded, toggleExpanded] = useToggle(true);

const fagrcStore = useFagrcStore();

const games = fagrcStore.games;

const selectGame = (game: Game.Select) => {
  fagrcStore.setCurrentGame(game);
  toggleExpanded();
};
</script>
