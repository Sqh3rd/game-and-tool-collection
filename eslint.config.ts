import nx from "@nx/eslint-plugin";
import { defineConfig } from "eslint/config";
import tsEslint from "typescript-eslint";

export default defineConfig([
  nx.configs["flat/base"],
  {
    ignores: [
      "**/dist",
      "**/out-tsc",
      "**/vitest.config.*.timestamp*",
      "**/test-output",
    ],
    files: ["**/*.(ts|vue)"],
    extends: [
      tsEslint.configs.strictTypeChecked,
      nx.configs["flat/typescript"],
    ],
    languageOptions: { parserOptions: { projectService: true } },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"],
          depConstraints: [{ sourceTag: "*", onlyDependOnLibsWithTags: ["*"] }],
          includeTransitiveDependencies: true,
        },
      ],
      "no-unused-vars": "off",
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
    },
  },
]);
