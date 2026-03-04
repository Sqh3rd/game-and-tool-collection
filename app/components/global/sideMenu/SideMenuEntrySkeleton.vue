<template>
  <SideMenuEntry :expanded="expanded">
    <template #icon>
      <Skeleton height="100%" />
    </template>
    <Skeleton height="100%" />
  </SideMenuEntry>
</template>

<script lang="ts" setup>
import Skeleton from "~/components/volt/Skeleton.vue";
import SideMenuEntry from "./SideMenuEntry.vue";

defineProps<{ expanded: boolean }>();
</script>

<style></style>
