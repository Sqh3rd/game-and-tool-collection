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
          :selected="game.isCurrentGame"
          @click.prevent="selectGame(game)"
        >
          <template #icon>
            <IconExternal
              v-if="game.icon.svg"
              :src="parseSimpleSVG(game.icon.svg)"
              width="2rem"
              height="2rem"
            />
            <span
              v-else
              class="w-8 h-8"
            />
          </template>
        </SideMenuEntry>
      </template>
    </SideMenu>
    <slot />
  </div>
</template>

<script setup lang="ts">
import SideMenu from "~/components/global/sideMenu/SideMenu.vue";
import SideMenuEntry from "~/components/global/sideMenu/SideMenuEntry.vue";
import IconExternal from "~/components/icons/IconExternal.vue";

const [isExpanded, toggleExpanded] = useToggle(true);

const fagrcStore = useFagrcStore();

const games = fagrcStore.games;

const selectGame = (game: SelectSchema["fagrc_game"]) => {
  fagrcStore.setCurrentGame(game);
  toggleExpanded(false);
};
</script>
