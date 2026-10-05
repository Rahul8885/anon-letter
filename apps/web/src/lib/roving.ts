const KEYS = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];

/**
 * ARIA radiogroup arrow handling: returns the index to move to, or null for any other key.
 * Arrows wrap; Home and End jump to the ends.
 */
export function rovingIndex(key: string, index: number, count: number): number | null {
  if (!KEYS.includes(key)) return null;
  const last = count - 1;
  if (key === "Home") return 0;
  if (key === "End") return last;
  if (key === "ArrowRight" || key === "ArrowDown") return index === last ? 0 : index + 1;
  return index === 0 ? last : index - 1;
}
