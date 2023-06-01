import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts"],
  noExternal: ["@sora/db", "@sora/id-generator"],
  format: ["cjs"],
});
