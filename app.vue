<script setup>
import Topnav from "./layouts/topnav";

const x = ref(0);
const y = ref(0);

const position = computed(() => ({
  top: y.value - 25 + "px",
  left: x.value - 25 + "px",
}));

function update(event) {
  x.value = event.pageX;
  y.value = event.pageY;
}

onMounted(() => window.addEventListener("mousemove", update));
onUnmounted(() => window.removeEventListener("mousemove", update));
</script>

<style>
:root {
  --primary-color: #b0b0b0;
  --background-color: #060606;
  --accent-color: #303030;

  --primary-border-color: #a0a0a0;
  --accent-border-color: #808080;
}

body {
  background-color: var(--background-color);
  color: var(--primary-color);
  font-size: 1.3rem;
  
  overflow: hidden;
}

.pointer {
  position: absolute;
  width: 50px;
  height: 50px;

  border-radius: 50%;

  background: radial-gradient(red, transparent 75%);
}
</style>

<template>
  <Topnav>
    <div class="container">
      <div class="pointer" :style="position" />
    </div>
  </TopNav>
</template>
