import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "../../../vitest.config.base";

export default mergeConfig(
  baseConfig,
  defineConfig({
    root: __dirname,
    test: { name: "@game-and-tool-collection/schemaModifier" },
  }),
);
