<template>
  <div class="rounded-lg">
    <span>{{ name }}</span>
    <Divider />
  </div>
</template>

<script setup lang="ts">
import Divider from "~/components/volt/Divider.vue";

type Participant = { name: string; icon?: SimpleSVGElement };
const { name } = defineProps<{
  inputs: Participant[];
  name: string;
  outputs: Participant[];
  recipes: Participant[];
  producers: Participant[];
}>();
</script>
