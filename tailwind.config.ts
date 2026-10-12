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
        navy: "#1B1F4B",
        "indigo-black": "#0F122E",
        royal: "#1E3FA8",
        cobalt: "#2447C4",
        surface: "#161A40",
        "surface-2": "#20255A",
        "surface-3": "#283070",
        gold: {
          DEFAULT: "#D9B26F",
          light: "#F0D38F",
          dark: "#A88345",
        },
        "text-main": "#F4EFE3",
        "text-muted": "#AEB3D6",
        silver: "#C9CED6",
        bronze: "#C08A55",
        success: "#34D399",
        warning: "#FBBF24",
        men: "#7AA2FF",
        women: "#F49AC1",
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "Cinzel", "serif"],
        heading: ["var(--font-oswald)", "Oswald", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      boxShadow: {
        "gold-glow": "0 0 24px rgba(217, 178, 111, 0.25)",
        "gold-glow-lg": "0 0 35px rgba(217, 178, 111, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
