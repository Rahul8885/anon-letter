import { type RefObject, useEffect } from "react";

/**
 * One observer for every `[data-reveal]` group inside `root`. A group gains `is-visible`
 * once and is then forgotten — scenes settle, they never replay on the way back up.
 *
 * Hidden states live under `html.js` only (index.html), so without JavaScript every
 * group renders in its final position.
 */
export function useReveal(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    const groups = Array.from(scope.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (!("IntersectionObserver" in window)) {
      for (const group of groups) group.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    for (const group of groups) observer.observe(group);
    return () => observer.disconnect();
  }, [root]);
}
