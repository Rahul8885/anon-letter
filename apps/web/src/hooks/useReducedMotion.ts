import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** Read once at mount and again on change, per PRODUCT.md accessibility contract. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** Coarse pointer or narrow viewport: no parallax, halved particle counts. */
export function useIsCompact(): boolean {
  const [compact, setCompact] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.innerWidth < 1024 || window.matchMedia("(pointer: coarse)").matches),
  );

  useEffect(() => {
    const onResize = () =>
      setCompact(window.innerWidth < 1024 || window.matchMedia("(pointer: coarse)").matches);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return compact;
}
