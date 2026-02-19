import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: { rootAttrs: { class: "h-full" } },
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  ssr: false,

  nitro: { experimental: { tasks: true } },
  vite: { plugins: [tailwindcss()] },
  hub: {
    db: { dialect: "postgresql", casing: "snake_case", useRelationsV2: true },
  },

  modules: [
    "nuxt-auth-utils",
    "@pinia/nuxt",
    "@nuxthub/core",
    "@vueuse/nuxt",
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
  ],
});
