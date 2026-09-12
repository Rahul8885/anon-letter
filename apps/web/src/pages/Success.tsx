import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
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
  const location = useLocation();
  const receipt = location.state as {
    deliveryMethod?: "email" | "link";
    messageUrl?: string;
  } | null;
  const emailDelivery = receipt?.deliveryMethod === "email";
  const reduced = useReducedMotion();
  const mood = useComposerStore((s) => s.mood);
  const reset = useComposerStore((s) => s.reset);
  const [sealed, setSealed] = useState(reduced);
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const linkInput = useRef<HTMLInputElement>(null);

  const url = receipt?.messageUrl || `${window.location.origin}/m/${slug ?? ""}`;
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
      setShareStatus("Link copied. Ready to share.");
    } catch {
      setCopied(false);
      linkInput.current?.focus();
      linkInput.current?.select();
      setShareStatus("Copy was unavailable. The link is selected so you can copy it manually.");
    }
  }

  async function share() {
    try {
      await navigator.share({ title: "A letter for you", url });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setShareStatus("Sharing was unavailable. Copy the link instead.");
      }
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
          {emailDelivery ? "Sent" : "Link ready"} — {time}
        </p>

        <h1 className="t-h1" style={{ margin: "var(--s4) 0 var(--s4)" }}>
          {emailDelivery ? (
            <>
              It&rsquo;s out of
              <br />
              <em className="t-em">your hands now.</em>
            </>
          ) : (
            <>
              Your letter is sealed.
              <br />
              <em className="t-em">Pass it along.</em>
            </>
          )}
        </h1>

        <p
          className="measure-caption"
          style={{ color: "var(--text-dim)", marginBottom: "var(--s8)" }}
        >
          {emailDelivery
            ? "Their address was used for delivery and discarded. You can also share the link below."
            : "Copy the link and send it wherever you like. Anyone with the link can open your letter."}{" "}
          The letter expires in thirty days.
        </p>

        <div className="link-row">
          <input
            ref={linkInput}
            aria-label="Letter link"
            readOnly
            value={url}
            onFocus={(event) => event.target.select()}
          />
          <Button variant="primary" magnetic={false} onClick={copy}>
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
        <output className="share-status t-caption">{shareStatus}</output>
        {typeof navigator.share === "function" && (
          <Button variant="secondary" onClick={share}>
            Share letter
          </Button>
        )}

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
