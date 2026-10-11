import { motion, useInView } from "framer-motion";
import { type CSSProperties, type ElementType, useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { EASE_ENTER } from "../../lib/motion";

type Direction = "top" | "bottom" | "left" | "right";

interface Props {
  /** "\n" breaks a line on purpose; the room's voice lives in the line break. */
  text: string;
  as?: ElementType;
  id?: string;
  className?: string;
  style?: CSSProperties;
  segmentBy?: "words" | "lines";
  /** Milliseconds between one segment and the next. */
  delay?: number;
  /** Seconds each segment takes to settle. */
  duration?: number;
  /** Where each segment arrives from. */
  direction?: Direction;
  /** Distance travelled, in em, so it scales with the type. */
  distance?: number;
  blur?: boolean;
  /** Milliseconds before the first segment moves. */
  startDelay?: number;
  /** Omitted: plays once when scrolled into view. Boolean: the caller owns the cue. */
  play?: boolean;
  /** Renders the resting state at once — the ceremony is never a hostage. */
  instant?: boolean;
  /** Keep "\n" as text (for pre-wrap paragraphs) instead of breaking into block lines. */
  preserveWhitespace?: boolean;
  /** Zero-based line indexes set in the emphasis colour. */
  emphasis?: number[];
  threshold?: number;
  onAnimationComplete?: () => void;
}

const offset = (direction: Direction, distance: number) => {
  const d = `${distance}em`;
  const n = `-${distance}em`;
  if (direction === "top") return { y: n };
  if (direction === "bottom") return { y: d };
  if (direction === "left") return { x: n };
  return { x: d };
};

/**
 * Word reveal: each word settles out of a soft blur, one after another. The full sentence is
 * always live DOM text for assistive tech; the animated copies are presentation only.
 * Reduced motion and `instant` render the final frame with no movement at all.
 */
export function StaggeredText({
  text,
  as: Tag = "p",
  id,
  className,
  style,
  segmentBy = "words",
  delay = 80,
  duration = 0.6,
  direction = "bottom",
  distance = 0.35,
  blur = true,
  startDelay = 0,
  play,
  instant = false,
  preserveWhitespace = false,
  emphasis,
  threshold = 0.2,
  onAnimationComplete,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: threshold });
  const still = reduced || instant;
  const active = still || (play ?? inView);
  const doneRef = useRef(onAnimationComplete);
  doneRef.current = onAnimationComplete;

  const lines = useMemo(
    () => (preserveWhitespace ? [text] : text.split("\n")).map(segment(segmentBy)),
    [text, segmentBy, preserveWhitespace],
  );
  const total = lines.reduce((sum, line) => sum + line.filter((t) => !t.space).length, 0);

  useEffect(() => {
    if (!active) return;
    if (still) {
      doneRef.current?.();
      return;
    }
    const ms = startDelay + Math.max(0, total - 1) * delay + duration * 1000;
    const timer = window.setTimeout(() => doneRef.current?.(), ms);
    return () => window.clearTimeout(timer);
  }, [active, still, startDelay, total, delay, duration]);

  const hidden = {
    opacity: 0,
    ...offset(direction, distance),
    ...(blur ? { filter: "blur(8px)" } : {}),
  };
  const shown = { opacity: 1, x: 0, y: 0, ...(blur ? { filter: "blur(0px)" } : {}) };

  let index = 0;
  return (
    <Tag ref={ref} id={id} className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {lines.map((tokens, lineIndex) => {
          const words = tokens.map((token, tokenIndex) => {
            if (token.space) return token.text;
            const at = index++;
            if (still) {
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
                <span key={tokenIndex} className="stagger-seg">
                  {token.text}
                </span>
              );
            }
            return (
              <motion.span
                // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
                key={tokenIndex}
                className="stagger-seg"
                initial={hidden}
                animate={active ? shown : hidden}
                transition={{
                  duration,
                  ease: EASE_ENTER,
                  delay: (startDelay + at * delay) / 1000,
                }}
              >
                {token.text}
              </motion.span>
            );
          });
          if (preserveWhitespace) return words;
          const Line = emphasis?.includes(lineIndex) ? "em" : "span";
          return (
            <Line
              // biome-ignore lint/suspicious/noArrayIndexKey: lines are positional
              key={lineIndex}
              className={`stagger-line${Line === "em" ? " t-em" : ""}`}
            >
              {words}
            </Line>
          );
        })}
      </span>
    </Tag>
  );
}

type Token = { text: string; space: boolean };

function segment(by: "words" | "lines") {
  return (line: string): Token[] => {
    if (by === "lines") return [{ text: line, space: false }];
    return line
      .split(/(\s+)/)
      .filter(Boolean)
      .map((part) => ({ text: part, space: /^\s+$/.test(part) }));
  };
}
