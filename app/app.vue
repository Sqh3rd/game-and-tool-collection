<template>
  <NuxtLayout>
    <Toast />
    <Spinner :show="spinnerStore.isLoading" />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import "~/assets/css/main.css";
import Spinner from "./components/global/Spinner.vue";
import { useGlobalSpinnerStore } from "./stores/globalSpinner";
import Toast from "./components/volt/Toast.vue";

const spinnerStore = useGlobalSpinnerStore();
</script>
