<template>
  <SideMenu :is-expanded="isExpanded">
    <template #title>
      <div class="flex flex-row items-center justify-center h-5">
        <span
          v-if="isExpanded"
          class="text-lg font-semibold"
          >{{ title }}</span
        >
        <div
          v-if="isExpanded"
          class="grow"
        />
        <i
          v-if="isExpanded"
          class="pi pi-angle-double-left cursor-pointer"
          @click.prevent="$emit('toggleExpanded')"
        />
        <i
          v-else
          class="pi pi-angle-double-right cursor-pointer"
          @click.prevent="$emit('toggleExpanded')"
        />
      </div>
    </template>
    <template #content>
      <div class="flex flex-col justify-center gap-2">
        <SideMenuEntry
          v-for="entry of entries"
          :key="entry.key"
          :expanded="isExpanded"
          :label="entry.label"
          :selected="entry.isSelected"
          @click.prevent="$emit('selectEntry', entry)"
        >
          <template #icon>
            <IconExternal
              v-if="entry.icon"
              :src="entry.icon"
              class="w-8 h-8"
            />
            <span
              v-else
              class="w-8 h-8"
            />
          </template>
        </SideMenuEntry>
      </div>
    </template>
  </SideMenu>
</template>

<script lang="ts" setup>
import IconExternal from "../icons/IconExternal.vue";

export type SideMenuIconEntry = {
  key: number | string;
  label: string;
  isSelected: boolean;

  icon?: SimpleSVGElement;
};
defineProps<{
  title: string;
  isExpanded: boolean;
  entries: SideMenuIconEntry[];
}>();
defineEmits<{ toggleExpanded: []; selectEntry: [entry: SideMenuIconEntry] }>();
</script>

<style></style>
