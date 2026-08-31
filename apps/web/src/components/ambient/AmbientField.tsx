import type { TemplateId } from "@anonletter/shared";
import { useEffect, useMemo, useRef } from "react";
import { useIsCompact, useReducedMotion } from "../../hooks/useReducedMotion";
import { room } from "../../lib/moods";

/**
 * One ambient field per room. Canvas for anything with motion physics (stars, dust,
 * confetti); DOM sprites for the photographed objects (petals, botanicals).
 *
 * The shipped star and dust atlases are hollow concentric rings that tile as a visible
 * polka-dot of soap bubbles, so both are drawn here instead: a real radial falloff with a
 * four-point diffraction cross, generated once into an offscreen sprite.
 */
/**
 * `density` scales every field to its container. A full-page room runs at 1; the composer's
 * preview card is a fifth of the area and forty confetti pieces in it reads as noise.
 */
export function AmbientField({
  mood,
  burst,
  density = 1,
}: { mood: TemplateId; burst?: boolean; density?: number }) {
  const kind = room(mood).ambient;

  if (kind === "petals") return <PetalField density={density} />;
  if (kind === "botanical") return <BotanicalField density={density} />;
  if (kind === "confetti") return <ConfettiField burst={burst ?? true} density={density} />;
  return <ParticleCanvas kind={kind} dark={room(mood).dark} density={density} />;
}

/* -------------------------------------------------------------------------- */
/* Stars and dust — drawn, not atlased                                        */
/* -------------------------------------------------------------------------- */

function makeSprite(rgb: string, cross: boolean): HTMLCanvasElement {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (!g) return c;

  const mid = size / 2;
  // A tight core with a short halo. A wide falloff is what turns a star into bokeh — the
  // halo, not the core, is the part that reads as blur.
  const grad = g.createRadialGradient(mid, mid, 0, mid, mid, mid);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.08, `rgba(${rgb},0.92)`);
  grad.addColorStop(0.2, `rgba(${rgb},0.3)`);
  grad.addColorStop(0.42, `rgba(${rgb},0.06)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);

  // the faint cross is what makes a point of light read as a star rather than a dot
  if (cross) {
    g.globalAlpha = 0.34;
    g.strokeStyle = `rgba(${rgb},1)`;
    g.lineWidth = 1;
    const arm = mid * 0.86;
    const line = g.createLinearGradient(mid - arm, mid, mid + arm, mid);
    line.addColorStop(0, `rgba(${rgb},0)`);
    line.addColorStop(0.5, `rgba(${rgb},0.9)`);
    line.addColorStop(1, `rgba(${rgb},0)`);
    g.strokeStyle = line;
    g.beginPath();
    g.moveTo(mid - arm, mid);
    g.lineTo(mid + arm, mid);
    g.stroke();
    const line2 = g.createLinearGradient(mid, mid - arm, mid, mid + arm);
    line2.addColorStop(0, `rgba(${rgb},0)`);
    line2.addColorStop(0.5, `rgba(${rgb},0.9)`);
    line2.addColorStop(1, `rgba(${rgb},0)`);
    g.strokeStyle = line2;
    g.beginPath();
    g.moveTo(mid, mid - arm);
    g.lineTo(mid, mid + arm);
    g.stroke();
  }

  return c;
}

interface Node {
  x: number;
  y: number;
  r: number;
  a: number;
  phase: number;
  speed: number;
  depth: number;
}

function ParticleCanvas({
  kind,
  dark,
  density,
}: { kind: "stars" | "dust"; dark: boolean; density: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const compact = useIsCompact();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const isStars = kind === "stars";
    // On a light room "dust" cannot be a light mote — it would be invisible. It is age
    // speckle instead: small, sparse and darker than the paper.
    const onDark = isStars || dark;
    const sprite = makeSprite(
      isStars ? "214,218,255" : onDark ? "224,206,168" : "104,80,44",
      isStars,
    );

    // three depth layers, far to near; parallax response 0.2 / 0.5 / 0.9
    const budget = (compact ? [34, 16, 6] : [70, 34, 12]).map((n) =>
      Math.max(3, Math.round(n * density)),
    );
    // draw size in CSS px per layer. A star is a point of light, not a bokeh disc — the
    // previous r*8 formula produced 36px blobs that read as snow.
    const sizeByLayer = isStars ? [2.2, 3.4, 5.2] : [2, 3.2, 4.6];
    const nodes: Node[] = [];
    for (let layer = 0; layer < 3; layer += 1) {
      for (let i = 0; i < budget[layer]; i += 1) {
        nodes.push({
          x: Math.random(),
          y: Math.random(),
          r: sizeByLayer[layer] * (0.7 + Math.random() * 0.6),
          a: isStars
            ? 0.26 + Math.random() * 0.5 * (0.5 + layer * 0.28)
            : (onDark ? 0.14 : 0.1) + Math.random() * 0.14,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.8,
          depth: [0.2, 0.5, 0.9][layer],
        });
      }
    }

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (event: PointerEvent) => {
      if (compact) return;
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const drawFrame = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      for (const n of nodes) {
        // dust drifts upward and sideways; stars hold position and twinkle
        const driftY = isStars ? 0 : ((t * 0.004 * n.speed) % 1.2) - 0.1;
        const px = (n.x + pointer.x * n.depth * 0.02) * w;
        const py = (n.y - driftY + pointer.y * n.depth * 0.02) * h;
        const twinkle = isStars
          ? 0.55 + 0.45 * Math.sin(t * 0.0013 * n.speed + n.phase)
          : 0.6 + 0.4 * Math.sin(t * 0.0006 + n.phase);
        const size = n.r * 3.4;

        ctx.globalAlpha = Math.max(0, n.a * twinkle);
        ctx.drawImage(sprite, px - size / 2, py - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    // reduced motion renders the resting frame once — the canvas never animates
    if (reduced) {
      drawFrame(0);
      window.addEventListener("resize", () => {
        resize();
        drawFrame(0);
      });
      return;
    }

    let raf = 0;
    let running = true;
    let slowFrames = 0;
    let last = performance.now();

    const loop = (t: number) => {
      const dt = t - last;
      last = t;
      // two missed frame budgets in a row and the field parks on its static frame
      if (dt > 34) slowFrames += 1;
      else slowFrames = 0;
      if (slowFrames > 2) {
        drawFrame(t);
        return;
      }
      drawFrame(t);
      if (running) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const resume = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => (document.hidden ? pause() : resume());
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? resume() : pause()),
      { threshold: 0 },
    );
    observer.observe(canvas);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      pause();
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [kind, dark, density, reduced, compact]);

  // decorative field; it carries no information and is never in the tab order
  // biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas has no tabindex here
  return <canvas ref={ref} className="ambient-canvas" aria-hidden="true" />;
}

/* -------------------------------------------------------------------------- */
/* Petals — the photographed sprite sheet, 4x4                                */
/* -------------------------------------------------------------------------- */

function PetalField({ density }: { density: number }) {
  const reduced = useReducedMotion();
  const compact = useIsCompact();
  const count = Math.max(3, Math.round((compact ? 7 : 12) * density));

  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const col = i % 4;
        const rowIndex = Math.floor(i / 4) % 4;
        // log-distributed so the small ones dominate
        const size = 14 + Math.round(20 * Math.random() ** 1.7);
        // the reading column is the left 58% — petals bias outward so nothing falls
        // across a sentence
        const band = i % 2 === 0 ? Math.random() * 26 : 62 + Math.random() * 36;
        return {
          key: i,
          left: `${band}%`,
          size,
          position: `${col * 33.3}% ${rowIndex * 33.3}%`,
          duration: 9 + Math.random() * 4,
          delay: -Math.random() * 12,
          opacity: 0.55 + Math.random() * 0.35,
        };
      }),
    [count],
  );

  return (
    <div className="ambient-canvas" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.key}
          className="petal"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundPosition: p.position,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: reduced ? p.opacity : undefined,
            // reduced motion scatters them at rest instead of falling, clear of the eyebrow
            // band at the top and of the reading column on the left
            top: reduced ? `${26 + ((p.key * 37) % 62)}%` : undefined,
            animationName: reduced ? "none" : undefined,
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Botanicals — one hero sprig plus at most three supporting                   */
/* -------------------------------------------------------------------------- */

/**
 * One hero sprig plus two supporting, all kept out of the reading column and off the footer
 * rail — a photographed rosebud sitting on top of the Report control is a contrast failure,
 * not decoration.
 */
const SPRIGS = [
  { left: "-6%", bottom: "22%", size: 170, pos: "0% 33.3%", opacity: 0.34, rate: 0.06 },
  { left: "72%", bottom: "18%", size: 120, pos: "50% 66.6%", opacity: 0.24, rate: 0.1 },
  { left: "88%", bottom: "46%", size: 96, pos: "75% 0%", opacity: 0.22, rate: 0.14 },
];

function BotanicalField({ density }: { density: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const compact = useIsCompact();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || compact) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        for (const child of Array.from(el.children) as HTMLElement[]) {
          const rate = Number(child.dataset.rate ?? 0);
          child.style.transform = `translate3d(0, ${y * rate}px, 0)`;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced, compact]);

  return (
    <div className="ambient-canvas" ref={ref} aria-hidden="true">
      {SPRIGS.slice(0, density < 0.6 ? 1 : 3).map((s) => (
        <span
          key={s.pos}
          className="sprig"
          data-rate={s.rate}
          style={{
            left: s.left,
            bottom: s.bottom,
            width: s.size,
            height: s.size,
            backgroundPosition: s.pos,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Confetti — one burst, then permanent stillness. Hard 2.5s kill.            */
/* -------------------------------------------------------------------------- */

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  cell: string;
  settled: boolean;
}

function ConfettiField({ burst, density }: { burst: boolean; density: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const compact = useIsCompact();

  const seeds = useMemo(() => {
    const total = Math.max(6, Math.round((compact ? 22 : 40) * density));
    return Array.from({ length: total }, (_, i) => ({
      cell: `${(i % 6) * 20}% ${(Math.floor(i / 6) % 6) * 20}%`,
      size: 10 + Math.round(Math.random() * 16),
      angle: -Math.PI / 2 + (Math.random() - 0.5) * 1.9,
      speed: 380 + Math.random() * 240,
      vr: (Math.random() - 0.5) * 1080,
      settleX: 6 + Math.random() * 88,
      settleY: 24 + Math.random() * 66,
      settleRot: Math.random() * 360,
    }));
  }, [compact, density]);

  useEffect(() => {
    const host = ref.current;
    if (!host || reduced || !burst) return;

    const nodes = Array.from(host.children) as HTMLElement[];
    const w = host.clientWidth;
    const h = host.clientHeight;

    const pieces: Piece[] = seeds.map((s) => ({
      x: w / 2,
      y: h * 0.42,
      vx: Math.cos(s.angle) * s.speed,
      vy: Math.sin(s.angle) * s.speed,
      rot: 0,
      vr: s.vr,
      size: s.size,
      cell: s.cell,
      settled: false,
    }));

    const GRAVITY = 900;
    const start = performance.now();
    let raf = 0;
    let last = start;

    const step = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;

      pieces.forEach((p, i) => {
        if (p.settled) return;
        p.vy += GRAVITY * dt;
        p.vx *= 0.99;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        const node = nodes[i];
        if (node) {
          node.style.transform = `translate3d(${p.x - p.size / 2}px, ${p.y - p.size / 2}px, 0) rotate(${p.rot}deg)`;
        }
      });

      // hard kill at 2.5s — celebration never loops
      if (t - start < 2500) {
        raf = requestAnimationFrame(step);
      } else {
        for (const node of nodes) {
          node.style.opacity = "0.5";
          node.style.zIndex = "var(--z-motif)";
        }
      }
    };

    for (const node of nodes) node.style.opacity = "0.9";
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seeds, reduced, burst]);

  const settled = reduced || !burst;

  return (
    <div className="ambient-canvas" ref={ref} aria-hidden="true">
      {seeds.map((s, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative field
          key={i}
          className="confetti-piece"
          style={{
            width: s.size,
            height: s.size,
            backgroundPosition: s.cell,
            // in flight they may cross in front of type; once settled they drop behind it,
            // because a paper heart parked on a headline is a legibility bug
            zIndex: settled ? "var(--z-motif)" : undefined,
            left: settled ? `${s.settleX}%` : 0,
            top: settled ? `${s.settleY}%` : 0,
            opacity: settled ? 0.5 : 0,
            transform: settled ? `rotate(${s.settleRot}deg)` : undefined,
          }}
        />
      ))}
    </div>
  );
}
