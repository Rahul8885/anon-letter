import type { TemplateId } from "@anonletter/shared";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { LETTER_PAPER, loadImage, stationerySources } from "../../lib/preloadImages";
import { STATIONERY, rectStyle } from "./stationeryAssets";

/**
 * The recipient's ceremony played backwards, from the same registered layers: the letter
 * slips into the pocket, the flap folds down, the fastener presses on.
 *
 * Phases are driven by the parent (`data-phase`); CSS owns every movement, so a parent can
 * jump straight to "sealed" (reduced motion, refresh) and get the final state instantly.
 *
 * The envelope stays invisible until every layer has decoded, so a slow network never shows
 * half an envelope or a browser's broken-image glyph; a layer that fails is simply left out.
 */
export type SealPhase = "open" | "tuck" | "close" | "sealed";

export function SealEnvelope({
  mood,
  phase,
  className = "",
}: {
  mood: TemplateId;
  phase: SealPhase;
  className?: string;
}) {
  const s = STATIONERY[mood];
  const [settled, setSettled] = useState<{ mood: TemplateId; failed: Set<string> } | null>(null);
  const ready = settled?.mood === mood;
  const failed = ready ? settled.failed : new Set<string>();

  useEffect(() => {
    let live = true;
    const sources = stationerySources(mood);
    Promise.all(sources.map(loadImage)).then((ok) => {
      if (live) setSettled({ mood, failed: new Set(sources.filter((_, i) => !ok[i])) });
    });
    return () => {
      live = false;
    };
  }, [mood]);

  const layer = (name: keyof typeof s.assets, className: string) => (
    <img
      className={`seal-layer ${className}`}
      src={s.assets[name]}
      alt=""
      hidden={failed.has(s.assets[name])}
    />
  );

  return (
    <div
      className={`seal-envelope ${className}`}
      data-phase={phase}
      data-gesture={s.gesture}
      data-ready={ready}
      style={
        {
          "--flap-hinge": `${s.hinge * 100}%`,
          "--closure-x": `${s.anchors.closure[0] * 100}%`,
          "--closure-y": `${s.anchors.closure[1] * 100}%`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      {layer("back", "seal-back")}
      {layer("flap-back", "seal-flap-back")}
      <div className="seal-letter" style={rectStyle(s.anchors.insert)}>
        <img src={LETTER_PAPER} alt="" hidden={failed.has(LETTER_PAPER)} />
      </div>
      {layer("pocket", "seal-pocket")}
      {layer("flap-front", "seal-flap-front")}
      {layer("closure", "seal-closure")}
    </div>
  );
}
