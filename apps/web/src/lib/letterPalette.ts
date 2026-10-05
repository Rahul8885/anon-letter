import type { TemplateId } from "@anonletter/shared";
import type { CSSProperties } from "react";

/** Stock, ink and desk colors are chosen together from each photographed envelope. */
export const LETTER_PALETTES = {
  "soft-bloom": {
    canvas: "#f3e7e3",
    paper: "#f0dcd7",
    ink: "#4b2d35",
    secondary: "#6d4a54",
    text: "#4b2d35",
    muted: "#76535c",
    border: "#c3aaa6",
  },
  "old-letter": {
    canvas: "#f3ead8",
    paper: "#ead8b5",
    ink: "#47331d",
    secondary: "#6e5333",
    text: "#47331d",
    muted: "#735a3c",
    border: "#c6b494",
  },
  "night-thought": {
    canvas: "#171e2b",
    paper: "#cad5e5",
    ink: "#263348",
    secondary: "#4c5c74",
    text: "#d7e0ed",
    muted: "#a1b1c8",
    border: "#53627a",
  },
  "quiet-garden": {
    canvas: "#e7ebde",
    paper: "#d6dfc8",
    ink: "#34442a",
    secondary: "#4e5e42",
    text: "#34442a",
    muted: "#59694d",
    border: "#aab49a",
  },
  "confetti-love": {
    canvas: "#f8efd6",
    paper: "#f4dfab",
    ink: "#4d3620",
    secondary: "#725230",
    text: "#4d3620",
    muted: "#795a36",
    border: "#c8b581",
  },
} satisfies Record<
  TemplateId,
  {
    canvas: string;
    paper: string;
    ink: string;
    secondary: string;
    text: string;
    muted: string;
    border: string;
  }
>;

export function letterPaletteStyle(mood: TemplateId, paperSurface = false): CSSProperties {
  const p = LETTER_PALETTES[mood];
  return {
    "--room-bg": paperSurface ? p.paper : p.canvas,
    "--room-surface": p.paper,
    "--room-text": paperSurface ? p.ink : p.text,
    "--room-muted": paperSurface ? p.secondary : p.muted,
    "--room-border": p.border,
    "--letter-paper": p.paper,
    "--letter-ink": p.ink,
    "--letter-secondary": p.secondary,
  } as CSSProperties;
}

/** Native color treatment retains the photograph's fibers, folds and alpha. */
export function paperToneMatrix(stock: string): string {
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(stock.slice(offset, offset + 2), 16) / 255,
  );
  const rows = channels.map((channel) =>
    [
      0.2126 * 0.4 * channel,
      0.7152 * 0.4 * channel,
      0.0722 * 0.4 * channel,
      0,
      0.65 * channel,
    ].join(" "),
  );
  return `${rows.join(" ")} 0 0 0 1 0`;
}
