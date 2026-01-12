// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import { globalIgnores } from "eslint/config";
import eslintPluginZodX from "eslint-plugin-zod-x";

export default withNuxt([
  globalIgnores(["./app/components/volt/**/*"]),
  eslintPluginZodX.configs.recommended,
]);
