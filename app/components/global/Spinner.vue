<template>
  <div
    v-if="show"
    class="absolute top-0 bottom-0 left-0 right-0 flex flex-col justify-center items-center opacity-50 bg-surface-500 dark:bg-surface-700 z-99999"
  >
    <CustomIcon
      svg="main"
      class="w-20 h-20 fill-none stroke-primary stroke-2 spinner"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{ show: boolean }>();
</script>

<style lang="css">
svg.spinner {
  stroke-dasharray: 30 70;
  animation: spinner 2.5s ease-in-out infinite;
}

@keyframes spinner {
  0% {
    stroke-dashoffset: 100px;
  }
  50% {
    stroke-dashoffset: 50px;
  }

  100% {
    stroke-dashoffset: 0px;
  }
}
</style>
