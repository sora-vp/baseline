import baseConfig from "@sora-vp/eslint-config/base";
import reactConfig from "@sora-vp/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [],
  },
  ...baseConfig,
  ...reactConfig,
];
