import { defineVitestProject } from "@nuxt/test-utils/config";
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "../../vitest.config.base";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        enabled: true,
        provider: "istanbul",
        include: ["**/*.ts", "**/*.vue"],
      },
      projects: [
        {
          test: {
            name: "unit",
            include: ["test/unit/**/*.{test,spec}.ts"],
            environment: "node",
          },
        },
        {
          test: {
            name: "e2e",
            include: ["test/e2e/**/*.{test,spec}.ts"],
            environment: "node",
          },
        },
        defineVitestProject({
          test: {
            name: "nuxt",
            include: ["test/nuxt/**/*.{test,spec}.ts"],
            environment: "nuxt",
          },
        }),
      ],
    },
  }),
);
