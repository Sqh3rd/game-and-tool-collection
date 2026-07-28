import { defineConfig } from "vitest/config";

export default defineConfig({
  cacheDir: "./node_modules/.vite/packages/schemaModifier",
  test: {
    coverage: {
      reportsDirectory: "./test-output/vitest/coverage",
      provider: "v8" as const,
    },
    environment: "node",
    globals: true,
    include: ["**/*.spec.ts"],
    exclude: ["**/*.types.spec.ts"],
    reporters: ["default"],
    typecheck: { enabled: true, include: ["**/*.types.spec.ts"] },
    watch: false,
  },
});
