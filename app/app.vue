<template>
  <NuxtLayout>
    <NuxtPage />
    <Spinner :show="spinnerStore.isLoading" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import "~/assets/css/main.css";
import Spinner from "./components/global/Spinner.vue";
import { useGlobalSpinnerStore } from "./stores/globalSpinner";

const spinnerStore = useGlobalSpinnerStore();
</script>
