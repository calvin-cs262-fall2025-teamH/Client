import js from "@eslint/js";
import globals from "globals";
import { configs as tseslintConfigs } from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
  tseslintConfigs.recommended,
  pluginReact.configs.flat.recommended,
]);
