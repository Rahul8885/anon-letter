import type { TemplateId } from "@anonletter/shared";
import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { LETTER_PALETTES, letterPaletteStyle, paperToneMatrix } from "../../lib/letterPalette";
import { type PaperLayer, STATIONERY, rectStyle } from "./stationeryAssets";

interface Props {
  mood: TemplateId;
  children: ReactNode;
  onOpened?: () => void;
  onSkip?: () => void;
}

const LAYERS: PaperLayer[] = ["back", "flap-front", "flap-back", "pocket"];

/** Paper is static; only the separate fastener images move on the first click. */
export function TactileLetter({ mood, children, onOpened, onSkip }: Props) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(reduced ? 3 : 0);
  const [settled, setSettled] = useState(reduced);
  const [instant, setInstant] = useState(reduced);
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const nextAction = useRef<HTMLButtonElement>(null);
  const reading = useRef<HTMLElement>(null);
  const keyboard = useRef(false);
  const notified = useRef(false);
  const stationery = STATIONERY[mood];
  const stockFilterId = `letter-stock-${useId()}`;
  const assetFailed = Object.values(stationery.assets).some((src) => failed.has(src));
  const ready = Object.values(stationery.assets).every((src) => loaded.has(src));
  const action = assetFailed
    ? "Read your letter"
    : stage === 0
      ? stationery.action
      : stage === 1
        ? "Lift the envelope flap"
        : "Unfold your letter";

  function imageLoaded(src: string) {
    setLoaded((current) => (current.has(src) ? current : new Set(current).add(src)));
  }

  function imageFailed(src: string) {
    setFailed((current) => (current.has(src) ? current : new Set(current).add(src)));
  }

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
    if (assetFailed) {
      skip();
      return;
    }
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

  return (
    <section
      className="ceremony ceremony-staged"
      data-stage={stage}
      data-open={stage === 3}
      data-settled={settled}
      data-ready={ready}
      data-asset-failed={assetFailed}
      data-paper-failed={failed.has("paper")}
      data-instant={instant}
      data-mood={mood}
      data-gesture={stationery.gesture}
      style={
        {
          ...letterPaletteStyle(mood),
          "--letter-stock-filter": `url("#${stockFilterId}")`,
        } as CSSProperties
      }
      aria-label="A private letter"
    >
      <svg
        className="ceremony-stock-filter"
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={stockFilterId}
            x="0"
            y="0"
            width="1"
            height="1"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix type="matrix" values={paperToneMatrix(LETTER_PALETTES[mood].paper)} />
          </filter>
        </defs>
      </svg>
      <div className="ceremony-intro" aria-hidden={stage === 3}>
        <p>Someone wrote this for you.</p>
        <span>Take a moment. It’s yours to open.</span>
      </div>

      <div className="ceremony-envelope-stage" aria-hidden={stage === 3}>
        <div
          className="ceremony-photo"
          style={
            {
              "--flap-hinge": `${stationery.hinge * 100}%`,
              "--closure-x": `${stationery.anchors.closure[0] * 100}%`,
              "--closure-y": `${stationery.anchors.closure[1] * 100}%`,
            } as CSSProperties
          }
        >
          {LAYERS.map((name) => (
            <img
              key={name}
              className={`ceremony-photo-layer photo-${name}`}
              src={stationery.assets[name]}
              alt=""
              hidden={failed.has(stationery.assets[name])}
              onLoad={() => imageLoaded(stationery.assets[name])}
              onError={() => imageFailed(stationery.assets[name])}
            />
          ))}
          {stationery.cut.map((clip, index) => (
            <img
              key={clip}
              className={`ceremony-photo-layer photo-closure-${index === 0 ? "left" : "right"}`}
              src={stationery.assets.closure}
              alt=""
              style={{ clipPath: clip }}
              hidden={failed.has(stationery.assets.closure)}
              onLoad={() => imageLoaded(stationery.assets.closure)}
              onError={() => imageFailed(stationery.assets.closure)}
            />
          ))}
          <div
            className="ceremony-folded-letter"
            aria-hidden="true"
            style={rectStyle(stationery.anchors.insert)}
          >
            <img
              src="/assets/letter-world/letter-paper.webp"
              alt=""
              hidden={failed.has("paper")}
              onError={() => imageFailed("paper")}
            />
            <span>For you.</span>
          </div>
          {stage === 2 && !assetFailed && (
            <button
              ref={nextAction}
              className="ceremony-hotspot letter-hotspot"
              style={rectStyle(stationery.targets.letter)}
              type="button"
              onClick={(event) => advance(event.detail)}
              aria-label="Unfold your letter"
            />
          )}
          {stage < 2 && !assetFailed && (
            <button
              ref={nextAction}
              className={`ceremony-hotspot ${stage === 0 ? "closure-hotspot" : "flap-hotspot"}`}
              style={rectStyle(stage === 0 ? stationery.targets.closure : stationery.targets.flap)}
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
            {assetFailed
              ? "Your letter is ready to read."
              : stage === 0
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
          className="ceremony-letter letter-sheet"
          data-mood={mood}
          aria-label="Your letter"
          initial={instant ? false : { y: 145, scale: 0.72, opacity: 0.3 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: instant ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ceremony-paper-folds" aria-hidden="true">
            {[0, 1, 2].map((fold) => (
              <div key={fold} className={`ceremony-paper-panel paper-panel-${fold}`}>
                <img
                  src="/assets/letter-world/letter-paper.webp"
                  alt=""
                  hidden={failed.has("paper")}
                  onError={() => imageFailed("paper")}
                />
              </div>
            ))}
          </div>
          <div
            className="ceremony-letter-content letter-sheet-content"
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
