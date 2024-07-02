// @ts-check

import eslint from "@eslint/js";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

import { restrictEnvAccess } from "@sora-vp/eslint-config/base";
import reactConfig from "@sora-vp/eslint-config/react";

export default tseslint.config(
  {
    ignores: ["dist/**"],
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...reactConfig,
  ...restrictEnvAccess,
);
