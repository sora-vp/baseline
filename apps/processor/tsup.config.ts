import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts"],
  noExternal: ["@sora-vp/db", "@sora-vp/id-generator"],
  format: ["esm"],
});
