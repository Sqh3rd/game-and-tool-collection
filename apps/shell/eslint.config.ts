import withNuxt from "./.nuxt/app.config.mjs";
import { rootConfig } from "../../eslint.config";

export default withNuxt(...rootConfig);
