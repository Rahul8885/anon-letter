import type { Config } from "tailwindcss";

/**
 * Tokens mirror DESIGN.md. The shell palette is fixed; room palettes are applied at runtime
 * as CSS variables on a `data-mood` root, so nothing here needs a per-mood variant.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: { DEFAULT: "#0b0a08", raised: "#141210" },
        paper: "#f2ede6",
        gold: { DEFAULT: "#c8a96e", lift: "#e2c99a" },
        wax: "#8a3020",
        success: "#7fae86",
        error: "#c9705c",
        // Room anchors, for static surfaces that must render a room without the runtime flip.
        bloom: { bg: "#fdf0f5", accent: "#f0a0ba", text: "#4a2030" },
        parchment: { bg: "#fdf6ec", accent: "#c4976a", text: "#3a2410" },
        night: { bg: "#1a1b2e", accent: "#8b90d0", text: "#c8caf0" },
        garden: { bg: "#eaf7f0", accent: "#3b6d11", text: "#1a3208" },
        confetti: { bg: "#fff8e7", accent: "#e8c99a", text: "#4a3010" }
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["Courier Prime", "Courier New", "monospace"],
        display: ["Playfair Display", "Georgia", "serif"],
        // Confetti Love — replaces Teko / Rajdhani. See DESIGN.md.
        party: ["Bricolage Grotesque", "Archivo", "system-ui", "sans-serif"],
        partyBody: ["Archivo", "system-ui", "sans-serif"]
      },
      fontSize: {
        label: ["0.625rem", { lineHeight: "1.4", letterSpacing: "0.34em" }],
        caption: ["0.78rem", { lineHeight: "1.6" }],
        body: ["0.9375rem", { lineHeight: "1.85" }],
        letter: ["1.1875rem", { lineHeight: "1.75" }],
        h3: ["1.5rem", { lineHeight: "1.3" }],
        h2: ["2rem", { lineHeight: "1.2" }],
        h1: ["clamp(1.875rem, 4.4vw, 3.25rem)", { lineHeight: "1.06", letterSpacing: "-0.01em" }],
        display: ["clamp(2.75rem, 7vw, 5.75rem)", { lineHeight: "0.96", letterSpacing: "-0.02em" }]
      },
      spacing: {
        gutter: "clamp(1.75rem, 7vw, 7.5rem)",
        section: "clamp(4.5rem, 9vw, 8.25rem)"
      },
      maxWidth: {
        letter: "46ch",
        prose: "62ch",
        caption: "48ch",
        page: "80rem"
      },
      borderRadius: {
        control: "2px",
        envelope: "3px",
        sheet: "4px"
      },
      zIndex: {
        ambient: "0",
        motif: "1",
        paper: "10",
        pocket: "20",
        flap: "30",
        seal: "40",
        fore: "50",
        ui: "100",
        sticky: "200",
        scrim: "300",
        modal: "310",
        toast: "400"
      },
      transitionTimingFunction: {
        enter: "cubic-bezier(0.22, 1, 0.36, 1)",
        object: "cubic-bezier(0.4, 0, 0.2, 1)"
      }
    }
  },
  plugins: []
} satisfies Config;
