import { IMAGES, type ImageName } from "./imageManifest";

/**
 * Responsive props for a letter-world photograph. `sizes` must describe the CSS width the image
 * renders at, so the browser fetches the smallest variant that is still sharp at the device's DPR.
 */
export function photo(name: ImageName, sizes: string) {
  const { src, srcSet, width, height } = IMAGES[name];
  return { src, srcSet, sizes, width, height };
}

let loaded = typeof document !== "undefined" && document.readyState === "complete";
const waiting = new Set<() => void>();

if (!loaded && typeof window !== "undefined") {
  window.addEventListener(
    "load",
    () => {
      loaded = true;
      for (const notify of waiting) notify();
      waiting.clear();
    },
    { once: true },
  );
}

/** Calls `fn` once the page (including the LCP image) has finished loading. */
export function afterPageLoad(fn: () => void) {
  if (loaded) fn();
  else waiting.add(fn);
}
