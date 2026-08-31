import type { TemplateId } from "@anonletter/shared";
import type { CSSProperties, ReactNode } from "react";
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
  const r = room(mood);

  return (
    <div className={`room ${className ?? ""}`} data-mood={mood} style={style}>
      <AmbientField mood={mood} burst={burst} />

      {/* one corner motif, never a border frame */}
      {r.motifArt && mood !== "confetti-love" && (
        <img className={`room-motif room-motif-${mood}`} src={r.motifArt} alt="" loading="lazy" />
      )}
      {mood === "confetti-love" && r.motifArt && (
        <img
          className="room-motif room-motif-confetti-love"
          src={r.motifArt}
          alt=""
          loading="lazy"
        />
      )}

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
        {lead.lines?.map((line, i) => (
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
