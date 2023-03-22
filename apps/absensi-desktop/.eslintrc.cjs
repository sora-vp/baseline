module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: "module",
    ecmaVersion: 2021,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:react",
    "plugin:react/jsx-runtime",
    "plugin:@typescript-eslint",
    "plugin:@typescript-eslint/eslint",
    "plugin:prettier",
  ],
  rules: {
    "@typescript-eslint/ban-ts-comment": [
      "error",
      { "ts-ignore": "allow-with-description" },
    ],
    "@typescript-eslint/no-empty-function": [
      "error",
      { allow: ["arrowFunctions"] },
    ],
    "@typescript-eslint/no-var-requires": "off",
  },
  overrides: [
    {
      files: ["*.js"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
      },
    },
  ],
};
