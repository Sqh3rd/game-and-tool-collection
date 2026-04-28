import type { StorybookConfig } from "@nuxtjs/storybook";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.ts",
    "../app/components/**/*.stories.ts",
  ],
  framework: "@storybook-vue/nuxt",
};

export default config;
