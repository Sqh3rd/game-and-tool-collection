<template>
  <div class="size-full p-5 flex flex-col justify-center items-center gap-5">
    <h1 class="text-3xl">Tools</h1>
    <Divider class="w-1/2!" />
    <span>Collection of mildly useful/interesting tools</span>
    <div class="w-full grid grid-cols-4 gap-4">
      <NuxtLink
        v-for="tool in tools"
        :key="tool.title"
        :to="tool.link"
      >
        <Card
          class="size-full cursor-pointer border-2 border-transparent duration-100 hover:border-primary-150 dark:hover:border-primary-600 hover:-translate-y-2"
        >
          <template #header>
            <IconCustom
              icon="main"
              class="stroke-2 fill-transparent stroke-surface-400 p-5 h-30 w-full"
            />
            <Divider align="top" />
          </template>
          <template #title>{{ tool.title }}</template>
          <template #subtitle>{{ tool.subtitle }}</template>
          <template #content>{{ tool.description }}</template>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconCustom from "~/components/icons/IconCustom.vue";
import Card from "~/components/volt/Card.vue";
import Divider from "~/components/volt/Divider.vue";

type Tool = {
  title: string;
  subtitle: string;
  imgSrc: string;
  description: string;
  link: string;
};
const tools: Tool[] = [
  {
    title: "F/AGRC",
    subtitle: "Factory/Automation Game Recipe Calculator",
    imgSrc: "",
    description:
      "A tool to help with calculating input and output ratios for factory and automation games.",
    link: "/tools/fagrc",
  },
  {
    title: "Some other tool",
    subtitle: "2nd tool",
    imgSrc: "",
    description: "another tool",
    link: "/tools/another",
  },
  {
    title: "Some other tool",
    subtitle: "2nd tool",
    imgSrc: "",
    description: "another tool",
    link: "/tools/another",
  },
  {
    title: "Some other tool",
    subtitle: "2nd tool",
    imgSrc: "",
    description: "another tool",
    link: "/tools/another",
  },
];
</script>
