import { gsap } from "gsap";
import { useEffect, useMemo, useRef } from "react";
import { useIsCompact, useReducedMotion } from "../../hooks/useReducedMotion";

export type EnvelopeState = "sealed" | "opening" | "open";

interface Props {
  state: EnvelopeState;
  /** Dark stationery screens its grain instead of multiplying it. */
  dark?: boolean;
  /** Art-box width. The envelope is always 3:2 inside it. */
  size?: string;
  /** Idle bob + cursor-proximity tilt. Off inside the composer preview. */
  alive?: boolean;
  className?: string;
}

/**
 * One object, three states, five moods. Drawn in CSS so it retints from six variables —
 * the shipped envelope PNGs are locked oxblood and would give every room a maroon envelope.
 * The design system reserves those bitmaps for static surfaces (OG images, email headers).
 *
 * Construction, front to back: flap triangle (own origin, above everything when closed) ·
 * pocket front carrying both side folds and the bottom triangle, hairline at each crease ·
 * letter sheet · back panel.
 */
export function Envelope({
  state,
  size = "clamp(240px, 34vw, 460px)",
  alive,
  dark = true,
  className,
}: Props) {
  const box = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const compact = useIsCompact();

  // shard positions are stable for the life of the component so the break looks intentional
  const shards = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        cell: `${(i % 3) * 50}% ${Math.floor(i / 3) * 50}%`,
        size: 6 + Math.random() * 5,
        angle: (i / 6) * Math.PI * 2 + Math.random() * 0.7,
        distance: 40 + Math.random() * 80,
        spin: (Math.random() - 0.5) * 360,
      })),
    [],
  );

  // cursor proximity tilts the object up to 6 degrees on two axes within 240px
  useEffect(() => {
    const el = box.current;
    if (!el || reduced || compact || !alive) return;

    const onMove = (event: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > 240 + r.width / 2) {
        gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "power2.out" });
        return;
      }
      gsap.to(el, {
        rotateY: gsap.utils.clamp(-6, 6, (dx / r.width) * 10),
        rotateX: gsap.utils.clamp(-6, 6, (-dy / r.height) * 10),
        duration: 0.6,
        ease: "power2.out",
      });
    };

    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.killTweensOf(el);
      gsap.set(el, { rotateX: 0, rotateY: 0 });
    };
  }, [reduced, compact, alive]);

  // shards fly once, at the moment the seal breaks
  useEffect(() => {
    const el = box.current;
    if (!el || state !== "opening" || reduced) return;

    const nodes = el.querySelectorAll<HTMLElement>(".env-shard");
    gsap.set(nodes, { opacity: 0.9, x: 0, y: 0, rotate: 0, scale: 1 });
    gsap.to(nodes, {
      x: (i: number) => Math.cos(shards[i].angle) * shards[i].distance,
      y: (i: number) => Math.sin(shards[i].angle) * shards[i].distance + 40,
      rotate: (i: number) => shards[i].spin,
      scale: 0.7,
      opacity: 0,
      duration: 0.9,
      stagger: 0.02,
      ease: "power2.out",
    });
  }, [state, reduced, shards]);

  const resolved: EnvelopeState = reduced && state !== "sealed" ? "open" : state;

  return (
    <div
      className={`env-stage ${className ?? ""}`}
      style={{ width: size, perspective: "900px" }}
      aria-hidden="true"
    >
      <div
        ref={box}
        className={`env ${alive && !reduced && resolved === "sealed" ? "env-bob" : ""}`}
        data-state={resolved}
      >
        {/* back panel first: without it the flap's shoulders show the page through */}
        <div className={`env-back tex-paper ${dark ? "is-dark" : ""}`} />

        {/* the sheet rises from behind the pocket's top edge */}
        <span className="env-sheet" />

        <div className="env-pocket">
          <span className="env-fold-l" />
          <span className="env-fold-r" />
          <span className="env-crease" />
          <span className="env-bottom" />
          <span
            className={`tex-paper ${dark ? "is-dark" : ""}`}
            style={{ position: "absolute", inset: 0 }}
          />
        </div>

        <div className="env-flap">
          <span className="env-flap-edge" />
          <span className="env-flap-face" />
          <span
            className={`tex-paper ${dark ? "is-dark" : ""}`}
            style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0,100% 0,50% 100%)" }}
          />
        </div>

        <span className="env-sheen" />

        <div className="env-seal">
          <span>A</span>
        </div>

        {shards.map((s) => (
          <span
            key={s.cell + s.angle}
            className="env-shard"
            style={{
              left: "50%",
              top: "58%",
              width: `${s.size}%`,
              aspectRatio: "1",
              marginLeft: `-${s.size / 2}%`,
              backgroundPosition: s.cell,
              opacity: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
