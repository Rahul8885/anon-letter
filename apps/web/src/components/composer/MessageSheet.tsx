import { useEffect, useId, useRef, useState } from "react";

const MAX = 800;
const NEAR = 720;

/**
 * A raised paper sheet on the void, not an inset well. The counter stays quiet until the
 * last tenth of the page, darkens there, and names the limit at 800 — it never scolds.
 *
 * The visible count is not a live region (it would speak on every keystroke); a separate
 * status line speaks once when the writer crosses into the last tenth and once at the end.
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
  const full = value.length >= MAX;
  const near = value.length >= NEAR;
  const level = full ? 2 : near ? 1 : 0;
  const announcedLevel = useRef(level);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (level === announcedLevel.current) return;
    if (level > announcedLevel.current) {
      setAnnouncement(
        level === 2 ? "That's the whole page." : `${MAX - value.length} characters left.`,
      );
    }
    announcedLevel.current = level;
  }, [level, value.length]);

  return (
    <div className="sheet tex-light" data-level={level}>
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
        {/* the draft lives in sessionStorage: it survives a refresh, not closing the tab */}
        <span>{moodName} · draft stays in this tab</span>
        <span id={counterId} className="sheet-counter">
          {full ? "That’s the whole page · " : ""}
          {value.length} / {MAX}
        </span>
      </div>
      <output className="sr-only">{announcement}</output>
      <span
        className="tex-paper"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
    </div>
  );
}
