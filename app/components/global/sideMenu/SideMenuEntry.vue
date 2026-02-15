<template>
  <button
    class="w-full flex flex-row dark:text-surface-400 text-surface-500 dark:hover:bg-surface-800 hover:bg-surface-100 duration-100"
  >
    <slot name="icon">
      <i
        v-if="icon"
        :class="['pi', icon]"
      />
    </slot>
    <slot>
      <span v-if="expanded">
        {{ label }}
      </span>
    </slot>
  </button>
</template>

<script lang="ts" setup>
defineProps<{ expanded?: boolean; icon?: string; label: string }>();
</script>

<style></style>
