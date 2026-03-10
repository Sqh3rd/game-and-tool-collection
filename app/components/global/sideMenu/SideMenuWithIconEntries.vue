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
      <div v-if="!entries">
        <SideMenuEntrySkeleton
          v-for="n in 10"
          :key="n"
          :expanded="isExpanded"
        />
      </div>
      <div v-else-if="!entries.length && placeholderText">
        <SideMenuEntry
          :expanded="isExpanded"
          :label="placeholderText"
          :disabled="true"
          icon="pi-times"
        />
      </div>
      <div
        v-else
        class="flex flex-col justify-center"
      >
        <SideMenuEntry
          v-for="entry of entries"
          :key="entry.key"
          :expanded="isExpanded"
          :label="entry.label"
          :selected="entry.isSelected"
          :disabled="entry.disabled"
          :icon="entry.icon"
          @click.prevent="$emit('selectEntry', entry)"
        >
          <template
            v-if="!entry.icon"
            #icon
          >
            <span>{{ abbreviate(entry.label) }}</span>
          </template>
        </SideMenuEntry>
      </div>
    </template>
  </SideMenu>
</template>

<script lang="ts" setup>
import SideMenuEntrySkeleton from "./SideMenuEntrySkeleton.vue";

export type SideMenuIconEntry = {
  key: number | string;
  label: string;
  isSelected: boolean;

  icon?: SimpleSVGElement | string;
  disabled?: true;
};
defineProps<{
  title: string;
  isExpanded: boolean;
  entries: SideMenuIconEntry[] | null | undefined;
  placeholderText?: string;
}>();
defineEmits<{ toggleExpanded: []; selectEntry: [entry: SideMenuIconEntry] }>();

const abbreviate = (it: string) => {
  console.log(`Abbreviating "${it}"`);
  const split = it.split(" ");
  if (split.length === 1) return it.substring(0, 2);
  return split.slice(0, 2).reduce((prev, cur) => prev + cur.charAt(0), "");
};
</script>

<style></style>
