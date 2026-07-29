import { defineConfig } from "eslint/config";
import baseConfig from "../../../eslint.base.config";

export default defineConfig([
  ...baseConfig,
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
    languageOptions: { parser: await import("jsonc-eslint-parser") },
  },
]);
