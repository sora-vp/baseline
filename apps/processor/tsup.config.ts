import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts"],
  noExternal: ["@sora/db"],
  format: ["cjs"],
});
