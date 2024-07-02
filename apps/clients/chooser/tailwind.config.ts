import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

import baseConfig from "@sora-vp/tailwind-config/web";

export default {
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  content: [...baseConfig.content, "../../../packages/ui/**/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist Variable", ...fontFamily.sans],
        mono: ["Geist Mono Variable", ...fontFamily.mono],
        sundanese: ["'Noto Sans Sundanese Variable'", "sans-serif"],
      },
    },
  },
} satisfies Config;
