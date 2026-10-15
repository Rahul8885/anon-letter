import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/** Direct route swaps: set scroll before paint, restore Back/Forward per history entry. */
export function useRouteScroll() {
  const { key } = useLocation();
  const type = useNavigationType();
  const positions = useRef(new Map<string, number>());
  const shown = useRef<string | null>(null);

  useLayoutEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const record = () => {
      if (shown.current !== null) positions.current.set(shown.current, window.scrollY);
    };
    window.addEventListener("scroll", record, { passive: true });
    return () => {
      window.removeEventListener("scroll", record);
      history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    if (shown.current !== null && shown.current !== key) {
      window.scrollTo({
        top: type === "POP" ? (positions.current.get(key) ?? 0) : 0,
        behavior: "instant",
      });
    }
    shown.current = key;
    positions.current.set(key, window.scrollY);
  }, [key, type]);
}
