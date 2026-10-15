import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Pages cross-fade with `AnimatePresence mode="wait"`: the old page stays painted for its
 * whole exit. Resetting scroll on navigation would jump that fading page to its own top — the
 * flash of the landing hero before the composer. So scroll belongs to the page that is
 * arriving: it is set the moment the new page mounts, after the old one has gone.
 *
 * Positions are remembered per history entry, so Back returns to where the reader was.
 */
const positions = new Map<string, number>();
/** The history entry whose page is on screen — not the one being navigated to. */
let shown: string | null = null;

/** Once, at the app root: take scroll restoration from the browser and record positions. */
export function useScrollMemory() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    let frame = 0;
    const record = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (shown !== null) positions.set(shown, window.scrollY);
      });
    };
    window.addEventListener("scroll", record, { passive: true });
    return () => {
      window.removeEventListener("scroll", record);
      cancelAnimationFrame(frame);
    };
  }, []);
}

/** Rendered inside each page; places the viewport before the page's first frame. */
export function RouteScrollAnchor() {
  const { key } = useLocation();
  const type = useNavigationType();

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once, as the page arrives
  useLayoutEffect(() => {
    // the first page keeps whatever the browser chose (a #hash, or the top); a StrictMode
    // re-run of the same page must not move it either
    if (shown === null || shown === key) {
      shown = key;
      return;
    }
    shown = key;
    const top = type === "POP" ? (positions.get(key) ?? 0) : 0;
    window.scrollTo({ top, behavior: "instant" });
  }, []);

  return null;
}
