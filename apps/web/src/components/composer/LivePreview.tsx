import type { TemplateId } from "@anonletter/shared";
import type { CSSProperties } from "react";
import { room } from "../../lib/moods";
import { AmbientField } from "../ambient/AmbientField";

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
      <p className="t-label" style={{ color: "rgba(200,169,110,0.6)", marginBottom: "var(--s4)" }}>
        What they&rsquo;ll see
      </p>
      <article
        className="preview-card"
        data-mood={mood}
        style={accent ? ({ "--room-accent": accent } as CSSProperties) : undefined}
        aria-live="polite"
      >
        <AmbientField mood={mood} burst={false} density={0.3} />
        {r.motifArt && (
          <img className={`room-motif room-motif-${mood}`} src={r.motifArt} alt="" loading="lazy" />
        )}

        <div style={{ position: "relative", zIndex: 100 }}>
          <p className="letter-greeting">{r.greeting}</p>
          <p className="letter-body">
            {message || "Your words will settle here as you write them."}
          </p>
          <hr className="letter-rule" />
          <p className="letter-sign">— from {fromHint.trim() || r.signature}</p>
        </div>
      </article>
      <p className="t-caption" style={{ marginTop: "var(--s4)", color: "var(--text-mute)" }}>
        Switch mood at any time — your words stay exactly where they are.
      </p>
    </div>
  );
}
