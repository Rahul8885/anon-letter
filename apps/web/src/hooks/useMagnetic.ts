import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { useIsCompact, useReducedMotion } from "./useReducedMotion";

/**
 * Magnetic pull at 0.18 of cursor offset, eased release (design.md bans elastic motion). Shell buttons only —
 * inside a room the buttons hold still, because the room already has its one gesture.
 */
export function useMagnetic<T extends HTMLElement>(enabled = true, strength = 0.18) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const compact = useIsCompact();

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || reduced || compact) return;

    const onMove = (event: PointerEvent) => {
      if ("disabled" in el && (el as { disabled?: boolean }).disabled) return;
      const r = el.getBoundingClientRect();
      const dx = event.clientX - (r.left + r.width / 2);
      const dy = event.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.4, ease: "power2.out" });
    };

    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: "power3.out" });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [enabled, strength, reduced, compact]);

  return ref;
}
