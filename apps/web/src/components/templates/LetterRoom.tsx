import type { TemplateId } from "@anonletter/shared";
import type { CSSProperties, ReactNode } from "react";
import { letterPaletteStyle } from "../../lib/letterPalette";
import { room } from "../../lib/moods";
import { AmbientField } from "../ambient/AmbientField";
import { StaggeredText } from "../ui/StaggeredText";

/**
 * Same skeleton every time: ambient layer, greeting, letter body at 46ch, signature, footer
 * rail with the report control. What changes is the room — palette, type, one motif, one
 * gesture. Five near-identical component files would be five places to fix the same bug.
 */

interface LeadConfig {
  /** How the room opens: a display headline, or a quiet inline greeting. */
  kind: "display" | "inline" | "salutation";
}

const LEAD: Record<TemplateId, LeadConfig> = {
  "soft-bloom": { kind: "display" },
  "old-letter": { kind: "salutation" },
  "night-thought": { kind: "inline" },
  "quiet-garden": { kind: "display" },
  "confetti-love": { kind: "display" },
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

/** Short, shared default for the editor, stationery previews and delivered letter. */
export function defaultHeading(mood: TemplateId): string {
  return room(mood).greeting;
}

/** The writer's heading when they changed it; otherwise the room's, line breaks intact. */
export function resolveHeading(mood: TemplateId, heading?: string | null): string {
  const own = heading?.replace(/\s+/g, " ").trim();
  const fallback = defaultHeading(mood);
  return own && own !== fallback.replace(/\n/g, " ") ? own : fallback;
}

/**
 * The lead — display headline, salutation, or a quiet greeting — in the writer's words when
 * they gave some. `reveal` lets it settle in word by word once `show` flips; without it the
 * heading is simply present, as it must be while the writer is still typing it.
 */
export function LetterLead({
  mood,
  show,
  heading,
  reveal = false,
  onRevealed,
}: {
  mood: TemplateId;
  show: boolean;
  heading?: string | null;
  reveal?: boolean;
  onRevealed?: () => void;
}) {
  const kind = LEAD[mood].kind;
  const text = resolveHeading(mood, heading);
  const className =
    kind === "display"
      ? "letter-lead t-room-display"
      : kind === "salutation"
        ? "letter-salutation"
        : "letter-greeting";

  return (
    <StaggeredText
      as={kind === "display" ? "h1" : "p"}
      className={className}
      text={text}
      play={show}
      instant={!reveal}
      delay={90}
      duration={0.7}
      distance={0.3}
      onAnimationComplete={onRevealed}
    />
  );
}
