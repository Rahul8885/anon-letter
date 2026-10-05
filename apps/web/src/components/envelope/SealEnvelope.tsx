import type { TemplateId } from "@anonletter/shared";
import type { CSSProperties } from "react";
import { STATIONERY, rectStyle } from "./stationeryAssets";

/**
 * The recipient's ceremony played backwards, from the same registered layers: the letter
 * slips into the pocket, the flap folds down, the fastener presses on.
 *
 * Phases are driven by the parent (`data-phase`); CSS owns every movement, so a parent can
 * jump straight to "sealed" (reduced motion, refresh) and get the final state instantly.
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
  return (
    <div
      className={`seal-envelope ${className}`}
      data-phase={phase}
      data-gesture={s.gesture}
      style={
        {
          "--flap-hinge": `${s.hinge * 100}%`,
          "--closure-x": `${s.anchors.closure[0] * 100}%`,
          "--closure-y": `${s.anchors.closure[1] * 100}%`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <img className="seal-layer seal-back" src={s.assets.back} alt="" />
      <img className="seal-layer seal-flap-back" src={s.assets["flap-back"]} alt="" />
      <div className="seal-letter" style={rectStyle(s.anchors.insert)}>
        <img src="/assets/letter-world/letter-paper.webp" alt="" />
      </div>
      <img className="seal-layer seal-pocket" src={s.assets.pocket} alt="" />
      <img className="seal-layer seal-flap-front" src={s.assets["flap-front"]} alt="" />
      <img className="seal-layer seal-closure" src={s.assets.closure} alt="" />
    </div>
  );
}
