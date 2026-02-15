// @ts-check
import eslintPluginZod from "eslint-plugin-zod";
import { globalIgnores } from "eslint/config";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt([
  globalIgnores(["./app/components/volt/**/*"]),
  eslintPluginZod.configs.recommended,
  { rules: { "@typescript-eslint/no-namespace": "off" } },
]);
