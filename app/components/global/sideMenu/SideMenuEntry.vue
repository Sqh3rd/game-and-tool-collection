<template>
  <button
    class="w-full flex flex-row p-2 gap-2 dark:text-surface-100 text-surface-900 hover:bg-highlight data-selected:bg-highlight-emphasis duration-200 content-center justify-center cursor-pointer rounded-lg hover:shadow data-selected:shadow-md"
    :aria-expanded="expanded"
    :data-selected="selected || undefined"
  >
    <slot name="icon">
      <i
        v-if="icon"
        :class="['pi', icon]"
      />
    </slot>
    <slot>
      <span
        v-if="expanded"
        class="content-center text-start grow"
      >
        {{ label }}
      </span>
    </slot>
  </button>
</template>

<script lang="ts" setup>
defineProps<{
  label: string;

  expanded?: boolean;
  icon?: string;
  selected?: boolean;
}>();
</script>
