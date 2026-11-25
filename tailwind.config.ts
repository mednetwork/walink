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
        whatsapp: {
          DEFAULT: "#008069",
          green: "#008069",
          punch: "#00A884",
          vibrant: "#25D366",
          dark: "#075E54",
          bg: "#F0F2F5",
          card: "#FFFFFF",
          surface: "#F7F8FA",
          border: "#E9EDEF",
          borderStrong: "#D1D7DB",
          text: "#111B21",
          muted: "#54656F",
          doodle: "#EFEAE2",
        },
        obsidian: {
          DEFAULT: "#F0F2F5",
          surface: "#FFFFFF",
          card: "#FFFFFF",
          border: "#E9EDEF",
        },
        passkit: {
          DEFAULT: "#008069",
          blue: "#008069",
          sky: "#00A884",
          indigo: "#075E54",
        },
        emerald: {
          500: "#008069",
          400: "#00A884",
          600: "#075E54",
        },
        gold: {
          500: "#F59E0B",
          400: "#FBBF24",
        },
        ruby: {
          500: "#EF4444",
        },
      },
      fontFamily: {
        arabic: [
          'var(--font-alexandria)',
          '"Alexandria"',
          'var(--font-noto-arabic)',
          '"Noto Sans Arabic"',
          '"Plus Jakarta Sans"',
          'sans-serif',
        ],
        sans: [
          'var(--font-plus-jakarta)',
          'var(--font-alexandria)',
          '"Alexandria"',
          'var(--font-noto-arabic)',
          'var(--font-inter)',
          '"Google Sans"',
          '"Plus Jakarta Sans"',
          '"Noto Sans Arabic"',
          '"Inter"',
          'system-ui',
          'sans-serif',
        ],
      },
      animation: {
        "shimmer": "shimmer 2.5s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-ping": "radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        radarPing: {
          "75%, 100%": {
            transform: "scale(2)",
            opacity: "0",
          },
        },
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)",
        "radial-highlight": "radial-gradient(circle at 50% 0%, rgba(0, 128, 105, 0.1), transparent 70%)",
      },
    },
  },
  plugins: [],
};
export default config;
