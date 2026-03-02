<template>
  <div>
    <button
      class="w-full flex flex-row p-2 gap-2 dark:text-surface-100 text-surface-900 duration-200 items-center justify-center rounded-lg"
      :aria-expanded="expanded"
    >
      <Skeleton height="2rem" width="2rem" class="shrink-0"/>
      <Skeleton height="2rem" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import Skeleton from '~/components/volt/Skeleton.vue';

defineProps<{ expanded: boolean }>();
</script>

<style></style>
