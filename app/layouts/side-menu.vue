<template>
  <div class="size-full flex flex-row gap-4">
    <div
      class="duration-200 w-10 p-expanded:w-10 gap-2 h-full flex-row"
      :p-expanded="expanded"
      :aria-expanded="expanded"
    >
      <div class="w-full">
        <slot
          v-for="item in items"
          :key="item.label"
          name="item"
        >
          <div
            class="flex flex-row w-full dark:text-surface-400 text-surface-500 dark:hover:bg-surface-800 hover:bg-surface-100 duration-200"
          >
            <i
              v-if="item.icon"
              :class="['pi', item.icon]"
            />
            <div
              v-else
              class="size-4"
            />
            <span>{{ item.label }}</span>
          </div>
        </slot>
      </div>
      <i
        v-if="expanded"
        class="pi pi-angle-double-right"
      />
      <i
        v-else
        class="pi pi-angle-double-left"
      />
    </div>
    <div class="size-full"><slot /></div>
    :<NuxtWelcome />
  </div>
</template>

<script setup lang="ts">
import type { Consumer } from "~~/shared/utils/helper-types";

export type SideMenuItem = {
  label: string;
  icon?: string;
  onClick?: Consumer<SideMenuItem>;
};
defineProps<{ expanded: boolean; items: SideMenuItem[] }>();
</script>
