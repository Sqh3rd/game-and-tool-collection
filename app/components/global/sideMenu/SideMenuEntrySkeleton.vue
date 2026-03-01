<template>
  <div>
    <button
      class="w-full flex flex-row p-2 gap-2 dark:text-surface-100 text-surface-900 hover:bg-highlight duration-200 items-center justify-center cursor-pointer rounded-lg shadow"
      :aria-expanded="expanded"
    >
      <div class="w-8 h-8 flex flex-col justify-center content-center" />
      <span
        v-if="expanded"
        class="content-center text-start grow"
      />
    </button>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ expanded: boolean }>();
</script>

<style></style>
