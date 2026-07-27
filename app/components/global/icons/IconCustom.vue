<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    :aria-labelledby="uidSpace.get(0)"
    :role="role"
  >
    <title
      :id="uidSpace.get(0)"
      lang="en"
    >
      {{ icon }} icon
    </title>
    <g v-if="iconValue === ICONS.main">
      <path
        d="M58.58,61.09c-1.17,0-2.26-.63-2.85-1.64l-8.58-14.86v9.7c0,1.29-1.05,2.34-2.34,2.34h-6.51c-1.1,0-2.04-.75-2.28-1.83l-1.88-8.37c-.3-1.32-1.35-2.32-2.68-2.56l-12.51-2.21c-.19-.03-.39-.05-.58-.05-1.14,0-2.19.57-2.81,1.54l-4.63,7.22c-.43.67-1.17,1.08-1.97,1.08-.27,0-.54-.05-.8-.14l-6.12-2.23c-1.21-.44-1.84-1.79-1.4-3l6.36-17.47c.71-2.13,2.68-3.56,4.89-3.56.3,0,.6.03.9.08l25.75,4.54-6.24-10.81-5.35,3.09c-.5.29-1.07.44-1.64.44-1.17,0-2.26-.63-2.85-1.64l-2.84-4.92c-.44-.76-.56-1.65-.33-2.49.23-.85.77-1.56,1.53-1.99L38.86.94c.5-.29,1.07-.44,1.64-.44,1.17,0,2.26.63,2.85,1.64l2.84,4.92c.91,1.57.37,3.58-1.2,4.49l-5.35,3.09,23.43,40.58c.91,1.57.37,3.58-1.2,4.49l-1.64.95c-.5.29-1.07.44-1.64.44h0Z"
        pathLength="100"
      />
    </g>
  </svg>
</template>

<script lang="ts" setup>
import { ICONS } from "./Icons";

const { uidSpace } = useUIDSpace();

const { icon, role = "img" } = defineProps<{
  icon: keyof typeof ICONS;
  role?: "application" | "document" | "img";
}>();

const iconValue = computed(() => ICONS[icon]);
</script>

<style></style>
