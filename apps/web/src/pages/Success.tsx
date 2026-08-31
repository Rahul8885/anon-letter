import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Envelope } from "../components/envelope/Envelope";
import { Button } from "../components/ui/Button";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { room } from "../lib/moods";
import { useComposerStore } from "../store/composerStore";

/**
 * The inverse of the reveal, and deliberately faster: the flap closes, the seal presses down,
 * then the copy arrives. Sending should feel like an ending, not a form submission.
 */
export function Success() {
  const { slug } = useParams<{ slug: string }>();
  const reduced = useReducedMotion();
  const mood = useComposerStore((s) => s.mood);
  const reset = useComposerStore((s) => s.reset);
  const [sealed, setSealed] = useState(reduced);
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/m/${slug ?? ""}`;
  const r = room(mood);
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => setSealed(true), 700);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="shell" data-mood={mood} style={{ ["--room-glow" as string]: r.glow }}>
      <div className="glow" />

      <main className="success-page">
        <div style={{ marginBottom: "var(--s12)" }}>
          <Envelope state={sealed ? "sealed" : "open"} size="clamp(200px, 26vw, 300px)" />
        </div>

        <p className="t-label" style={{ color: "rgba(200,169,110,0.62)" }}>
          Sent — {time}
        </p>

        <h1 className="t-h1" style={{ margin: "var(--s4) 0 var(--s4)" }}>
          It&rsquo;s out of
          <br />
          <em className="t-em">your hands now.</em>
        </h1>

        <p
          className="measure-caption"
          style={{ color: "var(--text-dim)", marginBottom: "var(--s8)" }}
        >
          Their address was used for delivery and discarded. The link below is yours to keep or to
          forget — the letter expires in thirty days either way.
        </p>

        <div className="link-row">
          <code>{url}</code>
          <Button variant="primary" magnetic={false} onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div className="hero-actions">
          <Link to="/compose" onClick={reset}>
            <Button variant="secondary">Write another</Button>
          </Link>
          <Link to="/">
            <Button variant="quiet">Home</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
