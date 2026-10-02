import type { TemplateId } from "@anonletter/shared";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { room } from "../../lib/moods";
import { LetterLead, LetterRoom } from "../templates/LetterRoom";

/**
 * What they'll see. Types in sync at 1:1 — no debounce beyond a frame — so the writer feels
 * the room forming under their hands. Mood switch re-skins by tweening CSS variables; the
 * words never re-mount.
 */
export function LivePreview({
  mood,
  message,
  fromHint,
  accent,
}: {
  mood: TemplateId;
  message: string;
  fromHint: string;
  accent?: string | null;
}) {
  const r = room(mood);

  return (
    <div>
      <p className="t-label" style={{ color: "var(--text-dim)", marginBottom: "var(--s4)" }}>
        What they&rsquo;ll see
      </p>
      <LetterRoom
        className="preview-card room-compact"
        mood={mood}
        burst={false}
        style={accent ? ({ "--room-accent": accent } as CSSProperties) : undefined}
      >
        <div className="letter-stack">
          <LetterLead mood={mood} show />
          <p className="letter-body">
            {message || "Your words will settle here as you write them."}
          </p>
          <hr className="letter-rule" />
          <p className="letter-sign">— from {fromHint.trim() || r.signature}</p>
        </div>
      </LetterRoom>
      {message.trim() && (
        <Link className="preview-link" to="/preview">
          Preview the full opening <span aria-hidden="true">↗</span>
        </Link>
      )}
      <p className="t-caption" style={{ marginTop: "var(--s4)", color: "var(--text-mute)" }}>
        Switch mood at any time — your words stay exactly where they are.
      </p>
    </div>
  );
}
