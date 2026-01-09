import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  vite: { plugins: [tailwindcss()] },
  ssr: false,

  runtimeConfig: { devAdminMail: "", devAdminPwd: "" },

  hub: { db: { dialect: "postgresql", casing: "snake_case" } },

  modules: [
    "nuxt-auth-utils",
    "@pinia/nuxt",
    "@nuxthub/core",
    "@vueuse/nuxt",
    "@nuxt/eslint",
  ],
});
