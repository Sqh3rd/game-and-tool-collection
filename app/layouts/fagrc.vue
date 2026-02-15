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
            @click.prevent="toggle"
          />
          <i
            v-else
            class="pi pi-angle-double-right cursor-pointer"
            @click.prevent="toggle"
          />
        </div>
      </template>
      <template #content>
        <SideMenuEntry
          v-for="game of games"
          :key="game.name"
          :expanded="isExpanded"
          :label="game.name"
          @click.prevent="() => item.onClick?.(item)"
        />
      </template>
    </SideMenu>
    <slot />
  </div>
</template>

<script setup lang="ts">
import SideMenu from "~/components/global/sideMenu/SideMenu.vue";
import SideMenuEntry from "~/components/global/sideMenu/SideMenuEntry.vue";

const SIDEBAR_ID = Symbol("sidebar");

export type SideMenuItem = {
  label: string;
  icon?: string;
  onClick?: Consumer<SideMenuItem>;
};

const sideMenuStore = useSideMenuStore();
const fagrcStore = useFagrcStore();

sideMenuStore.registerSideMenu(SIDEBAR_ID, true);
const isExpanded = sideMenuStore.getExpandedState(SIDEBAR_ID);
const toggle = () => sideMenuStore.toggleExpanded(SIDEBAR_ID);

const games = fagrcStore.games;
</script>
