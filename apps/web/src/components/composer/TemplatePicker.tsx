import type { TemplateId } from "@anonletter/shared";
import { useRef } from "react";
import { ROOM_LIST } from "../../lib/moods";

/**
 * 3:4 always. Rest shows the palette and the name; hover raises 4px and reveals the
 * use-case line; selection is a gold ring plus a check — never a colour change, because
 * the colour is the content.
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
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    const last = ROOM_LIST.length - 1;
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;

    const target = listRef.current?.querySelectorAll<HTMLButtonElement>("[role='radio']")[next];
    target?.focus();
    onChange(ROOM_LIST[next].id);
  }

  return (
    <div
      ref={listRef}
      className="picker"
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
            style={{ background: r.cardGradient }}
            onClick={() => onChange(r.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            onPointerEnter={() => onPreview?.(r.id)}
            onFocus={() => onPreview?.(r.id)}
          >
            {r.motifArt && <img className="card-art" src={r.motifArt} alt="" loading="lazy" />}
            {r.id === "night-thought" && <span className="card-stars" />}

            <span className="card-scrim" />

            {selected && (
              <span className="card-check" aria-hidden="true">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0b0a08"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M4 12l5 5 11-11" />
                </svg>
              </span>
            )}

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
