import type { TemplateId } from "@anonletter/shared";
import type { CSSProperties, ReactNode } from "react";
import { letterPaletteStyle } from "../../lib/letterPalette";
import { room } from "../../lib/moods";
import { AmbientField } from "../ambient/AmbientField";

/**
 * Same skeleton every time: ambient layer, greeting, letter body at 46ch, signature, footer
 * rail with the report control. What changes is the room — palette, type, one motif, one
 * gesture. Five near-identical component files would be five places to fix the same bug.
 */

interface LeadConfig {
  /** How the room opens: a display headline, or a quiet inline greeting. */
  kind: "display" | "inline" | "salutation";
  /** Display headlines break deliberately; the room's voice lives in the line break. */
  lines?: string[];
}

const LEAD: Record<TemplateId, LeadConfig> = {
  "soft-bloom": { kind: "display", lines: ["Be gentle", "with this one."] },
  "old-letter": { kind: "salutation" },
  "night-thought": { kind: "inline" },
  "quiet-garden": { kind: "display", lines: ["Grown quietly,", "and on purpose."] },
  "confetti-love": { kind: "display", lines: ["You did the", "whole thing."] },
};

export function LetterRoom({
  mood,
  eyebrow,
  children,
  burst,
  className,
  style,
}: {
  mood: TemplateId;
  eyebrow?: string;
  children: ReactNode;
  burst?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`room ${className ?? ""}`}
      data-mood={mood}
      style={{
        ...letterPaletteStyle(mood, className?.split(/\s+/).includes("room-compact")),
        ...style,
      }}
    >
      <div className="room-ambience" aria-hidden="true">
        {(mood === "night-thought" || mood === "old-letter" || mood === "confetti-love") && (
          <AmbientField mood={mood} burst={burst} density={0.6} />
        )}
      </div>
      <div className="room-decoration" aria-hidden="true">
        {mood === "soft-bloom" && (
          <img className="room-art room-art-petals" src="/assets/soft-bloom-petals.png" alt="" />
        )}
        {mood === "quiet-garden" && (
          <img className="room-art room-art-stem" src="/assets/quiet-garden-stem.png" alt="" />
        )}
        {mood === "old-letter" && (
          <img className="room-art room-art-seal" src="/assets/wax-seal.webp" alt="" />
        )}
      </div>

      <div className="room-inner">
        {eyebrow && <p className="room-eyebrow">{eyebrow}</p>}
        {children}
      </div>
    </div>
  );
}

/** The lead — display headline, salutation, or nothing but the greeting. */
export function LetterLead({ mood, show }: { mood: TemplateId; show: boolean }) {
  const r = room(mood);
  const lead = LEAD[mood];
  const style: CSSProperties = {
    opacity: show ? 1 : 0,
    transform: show ? "none" : "translateY(10px)",
    transition: "opacity 700ms var(--ease-enter), transform 700ms var(--ease-enter)",
  };

  if (lead.kind === "display") {
    return (
      <h1 className="letter-lead t-room-display" style={style}>
        {lead.lines?.map((line) => (
          <span key={line} style={{ display: "block" }}>
            {line}
          </span>
        )) ?? r.greeting}
      </h1>
    );
  }

  if (lead.kind === "salutation") {
    return (
      <p className="letter-salutation" style={style}>
        {r.greeting}
      </p>
    );
  }

  return (
    <p className="letter-greeting" style={style}>
      {r.greeting}
    </p>
  );
}
