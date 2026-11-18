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
        // DA du site snapdesk.co (repo Web-Site-SK, styles/tokens.css)
        primary: {
          50: "#f7f8f8",
          100: "#f8f5f0",
          200: "#dce0e0",
          300: "#c9cfcf",
          400: "#a1a7a8",
          500: "#e590a1",
          600: "#d7758a",
          700: "#3f4247",
          800: "#33363a",
          900: "#2a2c30",
          950: "#1f2124",
        },
        luxury: {
          gold: "#e590a1", // rose Snapdesk (accent)
          "gold-dark": "#d7758a", // survol des boutons
          champagne: "#e590a1",
          charcoal: "#3f4247", // texte / sections sombres
          slate: "#3f4247",
          muted: "#a1a7a8",
          cream: "#f8f5f0",
          surface: "#f7f8f8",
          border: "#dce0e0",
          sage: "#a9bcb7",
          dark: "#33363a",
        },
        reco: {
          bg: "#FAF7F2",
          elev: "#FFFFFF",
          ink: "#1A1A1A",
          "ink-soft": "#555149",
          "ink-faint": "#9A958B",
          line: "#E8E2D5",
          accent: "#E590A1",
          "accent-soft": "#FBE7EC",
          "accent-deep": "#C66E81",
          gold: "#C9A961",
        },
      },
      fontFamily: {
        serif: ["var(--font-josefin)", "Josefin Sans", "system-ui", "sans-serif"],
        sans: ["var(--font-josefin)", "Josefin Sans", "system-ui", "sans-serif"],
        fraunces: ["Fraunces", "Georgia", "serif"],
        geist: ["Geist", "Inter", "system-ui", "sans-serif"],
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
