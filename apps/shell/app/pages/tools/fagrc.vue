<template>
  <NuxtLayout name="fagrc" />
</template>

<script setup lang="ts">
const ID = Symbol();

const fagrcStore = useFagrcStore();
const spinnerStore = useSpinnerStore();

spinnerStore.startLoad(ID);
await fagrcStore.loadGames();
spinnerStore.endLoad(ID);
</script>
