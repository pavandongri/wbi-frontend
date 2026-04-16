import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginUnusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    plugins: {
      prettier: eslintPluginPrettier,
      "unused-imports": eslintPluginUnusedImports
    },

    rules: {
      "prettier/prettier": "error",
      "unused-imports/no-unused-imports": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ]
    }
  },

  globalIgnores([".next/**", "out/**", "build/**", "node_modules/**"])
]);
