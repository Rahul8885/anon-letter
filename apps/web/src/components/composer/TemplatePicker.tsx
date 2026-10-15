import type { TemplateId } from "@anonletter/shared";
import { useEffect, useLayoutEffect, useRef } from "react";
import { ROOM_LIST } from "../../lib/moods";
import { rovingIndex } from "../../lib/roving";

/**
 * Photographic stationery samples retain their own materials and palettes. Hover lifts
 * the object and quiets its neighbours; selection draws a check and underlines the name
 * without recoloring the art. The check stays mounted so it can draw in and out.
 *
 * Radiogroup with roving tabindex: arrows move, space or enter selects.
 */
export function TemplatePicker({
  value,
  onChange,
  onPreview,
}: {
  value: TemplateId | null;
  onChange: (id: TemplateId) => void;
  onPreview?: (id: TemplateId | null) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const next = rovingIndex(event.key, index, ROOM_LIST.length);
    if (next === null) return;
    event.preventDefault();

    const target = listRef.current?.querySelectorAll<HTMLButtonElement>("[role='radio']")[next];
    target?.focus();
    select(next, target);
  }

  // On phones the desk is a swipeable row: the chosen letter starts in the middle...
  // biome-ignore lint/correctness/useExhaustiveDependencies: placed once, before first paint
  useLayoutEffect(() => {
    const list = listRef.current;
    const index = ROOM_LIST.findIndex((r) => r.id === value);
    const card = list?.querySelectorAll<HTMLElement>("[role='radio']")[index];
    if (!list || !card || list.scrollWidth <= list.clientWidth) return;
    list.scrollLeft = card.offsetLeft - (list.clientWidth - card.offsetWidth) / 2;
  }, []);

  // ...and whichever letter a swipe comes to rest on is the one chosen. A tap's own scroll
  // settles on the card it already chose, so the two never disagree.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let timer = 0;

    function settle() {
      window.clearTimeout(timer);
      if (!list || list.scrollWidth <= list.clientWidth) return;
      const centre = list.scrollLeft + list.clientWidth / 2;
      const cards = Array.from(list.querySelectorAll<HTMLElement>("[role='radio']"));
      let nearest = 0;
      cards.forEach((card, i) => {
        const distance = (c: HTMLElement) => Math.abs(c.offsetLeft + c.offsetWidth / 2 - centre);
        if (distance(card) < distance(cards[nearest])) nearest = i;
      });
      if (ROOM_LIST[nearest].id !== value) onChange(ROOM_LIST[nearest].id);
    }

    // browsers without `scrollend` settle once the scroll has been quiet for a moment
    function quiet() {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, 140);
    }

    const native = "onscrollend" in window;
    const type = native ? "scrollend" : "scroll";
    const handler = native ? settle : quiet;
    list.addEventListener(type, handler, { passive: true });
    return () => {
      list.removeEventListener(type, handler);
      window.clearTimeout(timer);
    };
  }, [value, onChange]);

  /** On phones the desk becomes a swipeable row; the chosen letter slides to the middle. */
  function select(index: number, card?: HTMLElement | null) {
    onChange(ROOM_LIST[index].id);
    const list = listRef.current;
    if (!card || !list || list.scrollWidth <= list.clientWidth) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({
      left: card.offsetLeft - (list.clientWidth - card.offsetWidth) / 2,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  return (
    <div
      ref={listRef}
      className="picker stationery-picker"
      role="radiogroup"
      aria-label="Letter mood"
      onPointerLeave={() => onPreview?.(null)}
    >
      {ROOM_LIST.map((r, i) => {
        const selected = value === r.id;
        return (
          <button
            key={r.id}
            type="button"
            // biome-ignore lint/a11y/useSemanticElements: ARIA APG radiogroup with roving
            // tabindex — a native input cannot carry the card's art and hover reveal
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (!value && i === 0) ? 0 : -1}
            className={`card ${selected ? "is-selected" : ""} ${r.dark ? "is-dark" : ""}`}
            data-stationery={r.id}
            onClick={(e) => select(i, e.currentTarget)}
            onKeyDown={(e) => onKeyDown(e, i)}
            onPointerEnter={(e) => e.pointerType === "mouse" && onPreview?.(r.id)}
            onFocus={() => onPreview?.(r.id)}
          >
            <img
              className="stationery-sample"
              src={`/assets/letter-world/${r.id}.webp`}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />

            <span className="card-check" aria-hidden="true">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M4 12l5 5 11-11" pathLength={1} />
              </svg>
            </span>

            <span className="card-meta">
              <span className={`card-name card-name-${r.id}`}>{r.name}</span>
              <span className="card-use">{r.useCase}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
