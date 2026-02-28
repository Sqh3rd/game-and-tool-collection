// @ts-check
import { globalIgnores } from "eslint/config";
import eslintPluginTsdoc from "eslint-plugin-tsdoc";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt([
  globalIgnores(["./app/components/volt/**/*"]),
  {
    rules: {
      "@typescript-eslint/no-namespace": "off",
      "tsdoc/syntax": "error",
    },
    plugins: { tsdoc: eslintPluginTsdoc },
  },
]);
