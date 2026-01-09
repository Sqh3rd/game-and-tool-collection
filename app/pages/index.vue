<template>
  <div class="w-full h-full flex flex-col justify-center items-center gap-5">
    <CustomIcon
      svg="main"
      class="fill-primary w-40 h-40"
    />
    <h1 class="text-3xl">Game and Tool Collection</h1>
    <Divider class="w-1/2!" />
    <span>Lorem ipsum dolor sit amet</span>
  </div>
</template>

<script setup lang="ts">
import CustomIcon from "~/components/global/CustomIcon.vue";
import Divider from "~/components/volt/Divider.vue";

const userCount = await $fetch("/api/user/count", { method: "GET" });
</script>
