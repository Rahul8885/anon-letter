import { useId } from "react";

const MAX = 800;
const WARN = 760;

/**
 * A raised paper sheet on the void, not an inset well. The counter turns error at 760 and
 * blocks at 800 — it never scolds earlier.
 */
export function MessageSheet({
  value,
  onChange,
  moodName,
}: {
  value: string;
  onChange: (next: string) => void;
  moodName: string;
}) {
  const id = useId();
  const counterId = `${id}-counter`;
  const over = value.length > MAX;
  const warn = value.length >= WARN;

  return (
    <div className="sheet tex-light">
      <label className="sr-only" htmlFor={id}>
        Your message
      </label>
      <textarea
        id={id}
        className="sheet-textarea"
        value={value}
        maxLength={MAX}
        aria-describedby={counterId}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write the sentence you have been carrying."
      />
      <div className="sheet-meta">
        <span>{moodName} · never stored</span>
        <span
          id={counterId}
          className={over ? "counter-over" : warn ? "counter-warn" : undefined}
          aria-live="polite"
        >
          {value.length} / {MAX}
        </span>
      </div>
      <span
        className="tex-paper"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
    </div>
  );
}
