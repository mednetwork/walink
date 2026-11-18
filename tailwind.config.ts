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
        obsidian: {
          DEFAULT: "#060B18",
          surface: "#0D1528",
          card: "#152238",
          border: "rgba(255, 255, 255, 0.08)",
        },
        passkit: {
          DEFAULT: "#2563EB",
          blue: "#2563EB",
          sky: "#38BDF8",
          indigo: "#4F46E5",
        },
        emerald: {
          500: "#10B981",
          400: "#34D399",
        },
        gold: {
          500: "#F59E0B",
          400: "#FBBF24",
        },
        ruby: {
          500: "#F87171",
        },
      },
      fontFamily: {
        arabic: ['var(--font-noto-arabic)', '"Noto Sans Arabic"', '"Plus Jakarta Sans"', 'sans-serif'],
        sans: [
          'var(--font-plus-jakarta)',
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
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "radial-highlight": "radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.15), transparent 70%)",
      },
    },
  },
  plugins: [],
};
export default config;

