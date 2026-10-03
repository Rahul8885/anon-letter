import type { TemplateId } from "@anonletter/shared";
import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { type PhotoLayer, STATIONERY, photoLayers } from "./photographicLayers";

interface Props {
  mood: TemplateId;
  children: ReactNode;
  onOpened?: () => void;
  onSkip?: () => void;
}

const LAYERS: PhotoLayer[] = [
  "interior",
  "flap",
  "flap-inner",
  "pocket",
  "closure-left",
  "closure-right",
];

/** Each gesture belongs to the material already photographed for this mood. */
export function TactileLetter({ mood, children, onOpened, onSkip }: Props) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(reduced ? 3 : 0);
  const [settled, setSettled] = useState(reduced);
  const [instant, setInstant] = useState(reduced);
  const [ready, setReady] = useState(false);
  const canvases = useRef<Partial<Record<PhotoLayer, HTMLCanvasElement>>>({});
  const nextAction = useRef<HTMLButtonElement>(null);
  const reading = useRef<HTMLElement>(null);
  const keyboard = useRef(false);
  const notified = useRef(false);
  const stationery = STATIONERY[mood];
  const action =
    stage === 0 ? stationery.action : stage === 1 ? "Lift the envelope flap" : "Unfold your letter";

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    photoLayers(mood)
      .then(({ canvases: layers }) => {
        if (cancelled) return;
        for (const name of LAYERS) {
          const destination = canvases.current[name];
          if (!destination) continue;
          destination.width = layers[name].width;
          destination.height = layers[name].height;
          destination.getContext("2d")?.drawImage(layers[name], 0, 0);
        }
        setReady(true);
      })
      .catch(() => {
        // The original photo and text controls still allow every stage if canvas fails.
      });
    return () => {
      cancelled = true;
    };
  }, [mood, reduced]);

  useEffect(() => {
    if (reduced) {
      setInstant(true);
      setStage(3);
      setSettled(true);
    }
  }, [reduced]);

  useEffect(() => {
    if (stage !== 3) return;
    if (instant) {
      setSettled(true);
      return;
    }
    const timer = window.setTimeout(() => setSettled(true), 1100);
    return () => window.clearTimeout(timer);
  }, [stage, instant]);

  useEffect(() => {
    if (!settled || notified.current) return;
    notified.current = true;
    onOpened?.();
    if (keyboard.current) reading.current?.focus({ preventScroll: true });
  }, [settled, onOpened]);

  useEffect(() => {
    if (keyboard.current && stage < 3) nextAction.current?.focus({ preventScroll: true });
  }, [stage]);

  function advance(detail: number) {
    keyboard.current = detail === 0;
    setStage((current) => Math.min(3, current + 1));
  }

  function skip() {
    keyboard.current = true;
    setInstant(true);
    setStage(3);
    setSettled(true);
    onSkip?.();
  }

  useEffect(() => {
    if (settled) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      keyboard.current = true;
      setInstant(true);
      setStage(3);
      setSettled(true);
      onSkip?.();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [settled, onSkip]);

  const hotspot: CSSProperties = {
    left: `${stationery.hotspot[0] * 100}%`,
    top: `${stationery.hotspot[1] * 100}%`,
    width: `${stationery.hotspot[2] * 100}%`,
    height: `${stationery.hotspot[3] * 100}%`,
  };

  return (
    <section
      className="ceremony ceremony-staged"
      data-stage={stage}
      data-open={stage === 3}
      data-settled={settled}
      data-ready={ready}
      data-instant={instant}
      data-mood={mood}
      data-gesture={stationery.gesture}
      aria-label="A private letter"
    >
      <div className="ceremony-intro" aria-hidden={stage === 3}>
        <p>Someone wrote this for you.</p>
        <span>Take a moment. It’s yours to open.</span>
      </div>

      <div className="ceremony-envelope-stage" aria-hidden={stage === 3}>
        <div
          className="ceremony-photo"
          style={{ "--flap-hinge": `${stationery.hinge * 100}%` } as CSSProperties}
        >
          <img
            className="ceremony-photo-original"
            src={`/assets/letter-world/${mood}.webp`}
            alt=""
          />
          {LAYERS.map((name) => (
            // biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative canvas has no tabindex
            <canvas
              key={name}
              className={`ceremony-photo-layer photo-${name}`}
              ref={(element) => {
                if (element) canvases.current[name] = element;
              }}
              aria-hidden="true"
            />
          ))}
          <div className="ceremony-folded-letter" aria-hidden="true">
            <img src="/assets/letter-world/letter-paper.webp" alt="" />
            <span>For you.</span>
          </div>
          {stage === 2 && (
            <button
              ref={nextAction}
              className="ceremony-hotspot letter-hotspot"
              type="button"
              onClick={(event) => advance(event.detail)}
              aria-label="Unfold your letter"
            />
          )}
          {stage < 2 && (
            <button
              ref={nextAction}
              className={`ceremony-hotspot ${stage === 0 ? "closure-hotspot" : "flap-hotspot"}`}
              style={stage === 0 ? hotspot : undefined}
              type="button"
              onClick={(event) => advance(event.detail)}
              aria-label={action}
            />
          )}
        </div>
      </div>

      {stage < 3 && (
        <div className="ceremony-controls">
          <output className="ceremony-cue" aria-live="polite">
            {stage === 0
              ? "A little something, just for you."
              : stage === 1
                ? stationery.released
                : "There it is. Pull the letter out."}
          </output>
          <button
            type="button"
            className="ceremony-open"
            onClick={(event) => advance(event.detail)}
          >
            {action}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </button>
          <button type="button" className="ceremony-skip" onClick={skip}>
            Read without ceremony
          </button>
        </div>
      )}

      {stage === 3 && !settled && (
        <button className="ceremony-unfolding-skip" type="button" onClick={skip}>
          Read now
        </button>
      )}
      {stage === 3 && (
        <motion.article
          ref={reading}
          tabIndex={-1}
          className="ceremony-letter"
          aria-label="Your letter"
          initial={instant ? false : { y: 145, scale: 0.72, opacity: 0.3 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: instant ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ceremony-paper-folds" aria-hidden="true">
            {[0, 1, 2].map((fold) => (
              <div key={fold} className={`ceremony-paper-panel paper-panel-${fold}`}>
                <img src="/assets/letter-world/letter-paper.webp" alt="" />
              </div>
            ))}
          </div>
          <div
            className="ceremony-letter-content"
            aria-hidden={!settled}
            {...(!settled ? { inert: "" } : {})}
          >
            {children}
          </div>
        </motion.article>
      )}
    </section>
  );
}
