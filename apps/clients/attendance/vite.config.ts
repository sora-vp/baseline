import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // eslint-disable-next-line no-restricted-properties
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
});
