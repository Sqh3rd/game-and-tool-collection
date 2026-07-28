<template>
  <SideMenuEntry
    :expanded="expanded"
    disabled
  >
    <template #icon>
      <Skeleton
        height="100%"
        width="100%"
      />
    </template>
    <div class="h-8 grow">
      <Skeleton
        height="100%"
        width="100%"
      />
    </div>
  </SideMenuEntry>
</template>

<script lang="ts" setup>
import Skeleton from "~/components/volt/Skeleton.vue";
import SideMenuEntry from "./SideMenuEntry.vue";

defineProps<{ expanded: boolean }>();
</script>

<style></style>
