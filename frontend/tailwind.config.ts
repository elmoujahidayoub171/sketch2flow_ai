import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { ink: "#090c12", panel: "#111722", violet: "#9b7cff" },
      fontFamily: { sans: ["Manrope", "sans-serif"], mono: ["DM Mono", "monospace"] },
    },
  },
  plugins: [],
};

export default config;
