<template>
  <SideMenu
    :expanded="true"
    :items=""
  >
    <NuxtPage />
  </SideMenu>
</template>

<script setup lang="ts">
import SideMenu from "~/layouts/side-menu.vue";
</script>
