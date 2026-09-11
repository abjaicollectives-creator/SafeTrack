import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B1220",
        panel: "#0F1729",
        border: "#1E2A42",
        safe: "#1D9E75",
        warn: "#BA7517",
        danger: "#A32D2D",
      },
    },
  },
  plugins: [],
};
export default config;
