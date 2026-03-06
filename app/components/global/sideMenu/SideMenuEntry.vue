<template>
  <button
    class="w-full flex flex-row p-2 gap-2 dark:text-surface-100 dark:disabled:text-surface-300 text-surface-900 disabled:text-surface-800 disabled:italic hover:not-disabled:bg-highlight data-selected:bg-highlight-emphasis duration-200 items-center justify-center not-disabled:cursor-pointer rounded-lg hover:not-disabled:shadow data-selected:shadow-md"
    :aria-expanded="expanded"
    :data-selected="selected || undefined"
  >
    <div class="size-8 flex flex-col justify-center content-center shrink-0">
      <slot name="icon">
        <i
          v-if="icon"
          :class="['pi', icon]"
        />
      </slot>
    </div>
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
  label?: string;
  expanded?: boolean;
  icon?: string;
  selected?: boolean;
}>();
</script>
