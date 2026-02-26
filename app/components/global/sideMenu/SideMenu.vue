<template>
  <div
    class="duration-1000 w-24 aria-expanded:w-60 h-full flex flex-col bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-0 border-r border-surface-200 dark:border-surface-700 rounded-r-lg"
    :aria-expanded="isExpanded"
  >
    <div
      v-if="$slots.title"
      class="p-4 pb-0"
    >
      <slot name="title" />
      <Divider
        align="center"
      />
    </div>
    <div
      v-if="$slots.content"
      class="p-4 pt-0 overflow-y-auto"
    >
      <slot name="content" />
    </div>
    <div
      v-else
      class="grow"
    />
    <div
      v-if="$slots.footer"
      class="p-4"
    >
      <Divider
        v-if="isExpanded"
        align="center"
      />
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Divider from "~/components/volt/Divider.vue";

defineProps<{ isExpanded: boolean }>();
</script>

<style></style>
