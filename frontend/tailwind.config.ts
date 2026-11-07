import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080a0e",
        canvas: "#0b0e13",
        surface: { DEFAULT: "#11151d", 2: "#181e28" },
        raised: "#1b222e",
        line: "#252d3a",
        muted: "#8a94a7",
        accent: { DEFAULT: "#8b7cf6", soft: "#b9adff" },
        mint: { DEFAULT: "#5fe3c0", soft: "#a9f5e2" },
        warning: "#f3b35b",
        danger: "#f47d90",
        violet: "#9b7cff",
      },
      fontFamily: { sans: ["Manrope", "sans-serif"], mono: ["DM Mono", "monospace"] },
      boxShadow: {
        panel: "0 18px 50px rgba(2, 5, 10, .35)",
        lift: "0 18px 45px rgba(2, 5, 10, .28)",
      },
    },
  },
  plugins: [],
};

export default config;
