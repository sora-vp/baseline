import baseConfig from "@sora-vp/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**", "index.ts", "tsup.config.ts"],
  },
  ...baseConfig,
];
