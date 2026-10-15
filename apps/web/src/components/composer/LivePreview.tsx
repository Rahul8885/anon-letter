import type { TemplateId } from "@anonletter/shared";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { room } from "../../lib/moods";
import { Arrow } from "../editorial/EditorialHero";
import { LetterSheet } from "../envelope/LetterSheet";
import { LetterLead } from "../templates/LetterRoom";

/**
 * What they'll see: the reader's opened sheet, not a sketch of the room. Types in sync at
 * 1:1 — no debounce beyond a frame — so the writer feels the letter forming under their
 * hands. Mood switch re-tints by CSS variables; the words never re-mount.
 */
export function LivePreview({
  mood,
  message,
  heading,
  fromHint,
  accent,
}: {
  mood: TemplateId;
  message: string;
  heading: string | null;
  fromHint: string;
  accent?: string | null;
}) {
  const r = room(mood);

  return (
    <div>
      <p className="preview-label">What they&rsquo;ll see</p>
      <LetterSheet
        mood={mood}
        style={accent ? ({ "--room-accent": accent } as CSSProperties) : undefined}
      >
        <div className="letter-stack">
          <LetterLead mood={mood} show heading={heading} />
          <p className="letter-body">
            {message || "Your words will settle here as you write them."}
          </p>
          <hr className="letter-rule" />
          <p className="letter-sign">— from {fromHint.trim() || r.signature}</p>
        </div>
      </LetterSheet>
      {message.trim() && (
        <Link className="btn-outline preview-open" to="/preview">
          Preview the full opening <Arrow />
        </Link>
      )}
    </div>
  );
}
