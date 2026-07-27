import nx from "@nx/eslint-plugin";
import { defineConfig } from "eslint/config";
import tsEslint from "typescript-eslint";

export const rootConfig = [
  { plugins: { "@nx": nx } },
  ...defineConfig([
    tsEslint.configs.strict,
    {
      ignores: [
        "**/dist",
        "**/out-tsc",
        "**/vitest.config.*.timestamp*",
        "**/test-output",
      ],
    },
    {
      files: ["**/*.(ts|tsx|js|jsx|vue)"],
      rules: {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            enforceBuildableLibDependency: true,
            allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"],
            depConstraints: [
              { sourceTag: "*", onlyDependOnLibsWithTags: ["*"] },
            ],
          },
        ],
      },
    },
  ]),
];

export default rootConfig;
