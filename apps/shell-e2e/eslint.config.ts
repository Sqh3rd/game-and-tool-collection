import playwright from "eslint-plugin-playwright";
import baseConfig from "../../eslint.base.config";
import { defineConfig } from "eslint/config";

export default defineConfig(baseConfig, [
  playwright.configs["flat/recommended"],
]);
