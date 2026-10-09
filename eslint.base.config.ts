import nx from "@nx/eslint-plugin";
import { defineConfig } from "eslint/config";
import tsEslint from "typescript-eslint";

export default defineConfig([
  nx.configs["flat/base"],
  {
    ignores: ["**/dist", "**/out-tsc", "**/test-output"],
    files: ["**/*.ts", "**/*.vue"],
    extends: [
      tsEslint.configs.strictTypeChecked,
      nx.configs["flat/typescript"],
    ],
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ["eslint.config.ts"] },
      },
    },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: ["^.*/*(\\.base)?\\.config\\.ts$"],
          depConstraints: [{ sourceTag: "*", onlyDependOnLibsWithTags: ["*"] }],
          banTransitiveDependencies: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,

          enableAutofixRemoval: { imports: true },
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
]);
