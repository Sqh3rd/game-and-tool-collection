<template>
  <NuxtLayout>
    <Toast />
    <Spinner v-if="spinnerStore.isLoading" />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import "~/assets/css/main.css";
import Spinner from "./components/global/Spinner.vue";
import Toast from "./components/volt/Toast.vue";
import { useSpinnerStore } from "./stores/spinner";

useHeadSafe({
  title: "GaTC",
  htmlAttrs: { lang: "en" },
  link: [
    { rel: "icon", type: "image/svg+xml", href: "/assets/icons/main.svg" },
  ],
});

const spinnerStore = useSpinnerStore();
</script>
