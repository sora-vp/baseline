import baseConfig, { restrictEnvAccess } from "@sora-vp/eslint-config/base";
import nextjsConfig from "@sora-vp/eslint-config/nextjs";
import reactConfig from "@sora-vp/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
