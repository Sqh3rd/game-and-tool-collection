<template>
  <NuxtLayout name="fagrc">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const ID = Symbol(this);

const fagrcStore = useFagrcStore();
const spinnerStore = useSpinnerStore();

spinnerStore.startLoad(ID);
fagrcStore.loadGames();
spinnerStore.endLoad(ID);
</script>
