import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

import baseConfig from "@sora-vp/tailwind-config/web";

export default {
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  content: [
    ...baseConfig.content,
    "../../../packages/ui/**/*.{ts,tsx}",
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [baseConfig],
} satisfies Config;
