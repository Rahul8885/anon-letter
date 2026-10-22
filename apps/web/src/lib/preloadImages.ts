import type { TemplateId } from "@anonletter/shared";
import { STATIONERY } from "../components/envelope/stationeryAssets";

export const LETTER_PAPER = "/assets/letter-world/letter-paper.webp";

/** One fetch + decode per URL for the life of the tab; resolves false instead of rejecting. */
const pending = new Map<string, Promise<boolean>>();

export function loadImage(src: string): Promise<boolean> {
  let promise = pending.get(src);
  if (!promise) {
    const image = new Image();
    image.decoding = "async";
    image.src = src;
    promise = image
      .decode()
      .then(() => true)
      .catch(() => image.complete && image.naturalWidth > 0);
    pending.set(src, promise);
  }
  return promise;
}

/** Every bitmap the sealing envelope draws for a mood, letter paper included. */
export function stationerySources(mood: TemplateId): string[] {
  return [...Object.values(STATIONERY[mood].assets), LETTER_PAPER];
}

/** Resolves true when every layer is decoded, false if any failed or `timeout` passed first. */
export function whenStationeryReady(
  mood: TemplateId,
  timeout = Number.POSITIVE_INFINITY,
): Promise<boolean> {
  const all = Promise.all(stationerySources(mood).map(loadImage)).then((ok) => ok.every(Boolean));
  if (!Number.isFinite(timeout)) return all;
  return Promise.race([
    all,
    new Promise<boolean>((resolve) => window.setTimeout(() => resolve(false), timeout)),
  ]);
}
