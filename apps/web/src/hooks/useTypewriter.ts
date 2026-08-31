import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  /** Nothing types until this flips true — the reveal timeline owns the cue. */
  start: boolean;
  /** Reduced motion renders the message whole, immediately. */
  instant?: boolean;
  onDone?: () => void;
}

/**
 * Human-speed typing: 28–66ms per character with a pause after sentence-enders.
 * Returns the visible slice plus a `skip` — the ceremony is never a hostage.
 */
export function useTypewriter(text: string, { start, instant, onDone }: Options) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<number>();
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const skip = useCallback(() => {
    window.clearTimeout(timer.current);
    setCount(text.length);
    setDone((wasDone) => {
      if (!wasDone) onDoneRef.current?.();
      return true;
    });
  }, [text.length]);

  // a new message restarts the typing from zero
  // biome-ignore lint/correctness/useExhaustiveDependencies: text identity is the trigger
  useEffect(() => {
    setCount(0);
    setDone(false);
  }, [text]);

  useEffect(() => {
    if (!start) return;

    if (instant) {
      setCount(text.length);
      setDone(true);
      onDoneRef.current?.();
      return;
    }

    let i = 0;
    const step = () => {
      if (i >= text.length) {
        setDone(true);
        onDoneRef.current?.();
        return;
      }
      const ch = text[i];
      let delay = 28 + Math.random() * 38;
      if (ch === ".") delay += 220;
      if (ch === ",") delay += 100;
      if (ch === "\n") delay += 160;
      if (ch === "!") delay += 180;
      if (ch === "?") delay += 200;
      i += 1;
      setCount(i);
      timer.current = window.setTimeout(step, delay);
    };

    timer.current = window.setTimeout(step, 300);
    return () => window.clearTimeout(timer.current);
  }, [text, start, instant]);

  return { visible: text.slice(0, count), done, skip };
}
