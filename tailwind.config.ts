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
        primary: {
          50: "#faf8f5",
          100: "#f0ebe3",
          200: "#e0d5c5",
          300: "#c9b89e",
          400: "#b39a78",
          500: "#a3855f",
          600: "#957353",
          700: "#7c5d45",
          800: "#664d3d",
          900: "#544033",
          950: "#2d211a",
        },
        luxury: {
          gold: "#c5a572",
          champagne: "#f7e7ce",
          charcoal: "#2c2c2c",
          slate: "#4a4a4a",
          cream: "#faf8f5",
          dark: "#1a1a1a",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Playfair Display", "serif"],
        sans: ["Inter", "Helvetica Neue", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 1s ease-out",
        "slide-up": "slideUp 0.8s ease-out",
        "scale-in": "scaleIn 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
