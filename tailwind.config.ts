import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#542cb7",
          "purple-hover": "#45209c",
          "purple-light": "#f5f3ff",
          "purple-border": "#ddd6fe",
          navy: "#0b1320",
          "navy-dark": "#070c14",
          "navy-light": "#131f33",
          green: "#059669",
          "green-hover": "#047857",
          "green-light": "#eefaf3",
          "green-border": "#bbf7d0",
          gold: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "Cairo", "sans-serif"],
        cairo: ["var(--font-cairo)", "Cairo", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
