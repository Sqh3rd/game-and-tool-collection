<template>
  <component
    :is="src.tag"
    :attributes="src.attributes"
  >
    <!-- eslint-disable-next-line vue/valid-v-for -->
    <IconExternal
      v-for="child in src.children"
      :src="child"
    />
  </component>
</template>

<script lang="ts" setup>
const { src } = defineProps<{ src: SimpleSVGElement }>();
</script>

<style></style>
