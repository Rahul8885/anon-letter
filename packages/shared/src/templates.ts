import type { Template, TemplateId } from "./types";

export const TEMPLATES: Record<TemplateId, Template> = {
  "soft-bloom": {
    id: "soft-bloom",
    name: "Soft Bloom",
    tags: ["confession", "admiration", "secret admirer", "appreciation"],
    palette: { bg: "#fdf0f5", accent: "#f0a0ba", text: "#4a2030" },
    fonts: { display: "Playfair Display", body: "Lato" },
    motif: "flower"
  },
  "old-letter": {
    id: "old-letter",
    name: "Old Letter",
    tags: ["apology", "gratitude", "heartfelt", "honesty"],
    palette: { bg: "#fdf6ec", accent: "#c4976a", text: "#3a2410" },
    fonts: { display: "Courier New", body: "Georgia" },
    motif: "letter"
  },
  "night-thought": {
    id: "night-thought",
    name: "Night Thought",
    tags: ["honest truth", "late-night", "confession", "feelings"],
    palette: { bg: "#1a1b2e", accent: "#8b90d0", text: "#c8caf0" },
    fonts: { display: "Cormorant Garamond", body: "DM Sans" },
    motif: "star"
  },
  "quiet-garden": {
    id: "quiet-garden",
    name: "Quiet Garden",
    tags: ["gratitude", "birthday", "congratulations", "pride"],
    palette: { bg: "#eaf7f0", accent: "#3b6d11", text: "#1a3208" },
    fonts: { display: "Playfair Display", body: "Inter" },
    motif: "leaf"
  },
  "confetti-love": {
    id: "confetti-love",
    name: "Confetti Love",
    tags: ["celebration", "birthday", "hype", "excitement"],
    palette: { bg: "#fff8e7", accent: "#e8c99a", text: "#4a3010" },
    fonts: { display: "Teko", body: "Rajdhani" },
    motif: "confetti"
  }
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);
