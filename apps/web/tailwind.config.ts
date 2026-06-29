import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0b0a08",
        navy: "#1a1b2e",
        mist: "#8b90d0",
        starlight: "#c8caf0",
        gold: "#c9a96e"
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
