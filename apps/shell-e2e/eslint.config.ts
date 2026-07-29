import playwright from "eslint-plugin-playwright";
import baseConfig from "../../eslint.base.config";

export default [
  playwright.configs["flat/recommended"],
  ...baseConfig,
];
