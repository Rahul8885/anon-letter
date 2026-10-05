import type { TemplateId } from "@anonletter/shared";

/** Every image uses the same 3:2 canvas; coordinates are fractions of that canvas. */
export type Rect = readonly [left: number, top: number, width: number, height: number];
export type PaperLayer = "back" | "pocket" | "flap-front" | "flap-back";
type Gesture = "ribbon" | "wax" | "thread" | "band" | "tape";

interface Stationery {
  assets: Record<PaperLayer | "closure", string>;
  anchors: { envelope: Rect; insert: Rect; closure: readonly [number, number] };
  hinge: number;
  gesture: Gesture;
  action: string;
  released: string;
  targets: { closure: Rect; flap: Rect; letter: Rect };
  cut: readonly [string, string];
}

function stationery(
  mood: TemplateId,
  gesture: Gesture,
  action: string,
  released: string,
  closure: Rect,
  cutX: number,
): Stationery {
  const root = `/assets/letter-world/layers/${mood}`;
  const x = cutX * 100;
  // Complementary contours show a material break without changing envelope pixels.
  const edge =
    gesture === "wax"
      ? `${x}% 0%, ${x}% 48%, ${x - 1}% 53%, ${x + 1}% 57%, ${x - 0.5}% 61%, ${x}% 67%, ${x}% 100%`
      : `${x}% 0%, ${x}% 100%`;
  return {
    assets: {
      back: `${root}/back.webp`,
      pocket: `${root}/pocket.webp`,
      "flap-front": `${root}/flap-front.webp`,
      "flap-back": `${root}/flap-back.webp`,
      closure: `${root}/closure.webp`,
    },
    anchors: {
      envelope: [0.05, 0.1, 0.9, 0.8],
      insert: [0.11, 0.14, 0.78, 0.72],
      closure: [closure[0] + closure[2] / 2, closure[1] + closure[3] / 2],
    },
    hinge: 0.1,
    gesture,
    action,
    released,
    targets: { closure, flap: [0.05, 0.1, 0.9, 0.8], letter: [0.3, 0.18, 0.4, 0.18] },
    cut: [`polygon(0% 0%, ${edge}, 0% 100%)`, `polygon(${edge}, 100% 100%, 100% 0%)`],
  };
}

export const STATIONERY: Record<TemplateId, Stationery> = {
  "soft-bloom": stationery(
    "soft-bloom",
    "ribbon",
    "Untie the ribbon",
    "The ribbon is loose. Lift the flap.",
    [0.25, 0.36, 0.28, 0.25],
    0.38,
  ),
  "old-letter": stationery(
    "old-letter",
    "wax",
    "Break the wax seal",
    "The seal is broken. Lift the flap.",
    [0.435, 0.51, 0.13, 0.18],
    0.5,
  ),
  "night-thought": stationery(
    "night-thought",
    "thread",
    "Unwind the thread",
    "The thread is free. Lift the flap.",
    [0.44, 0.25, 0.12, 0.48],
    0.5,
  ),
  "quiet-garden": stationery(
    "quiet-garden",
    "band",
    "Slide off the band",
    "The band is off. Lift the flap.",
    [0.57, 0.14, 0.16, 0.72],
    0.65,
  ),
  "confetti-love": stationery(
    "confetti-love",
    "tape",
    "Peel back the tape",
    "The tape is peeled away. Lift the flap.",
    [0.27, 0.45, 0.26, 0.21],
    0.4,
  ),
};

export function rectStyle(rect: Rect) {
  return {
    left: `${rect[0] * 100}%`,
    top: `${rect[1] * 100}%`,
    width: `${rect[2] * 100}%`,
    height: `${rect[3] * 100}%`,
  };
}
