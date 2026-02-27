<template>
  <button
    class="w-full flex flex-row p-2 gap-2 dark:text-surface-400 text-surface-500 dark:hover:bg-surface-800 hover:bg-surface-100 duration-100 content-center justify-center cursor-pointer rounded-lg"
    :aria-expanded="expanded"
    :p-selected="selected"
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
