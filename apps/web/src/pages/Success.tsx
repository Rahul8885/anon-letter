import type { TemplateId } from "@anonletter/shared";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { SealEnvelope, type SealPhase } from "../components/envelope/SealEnvelope";
import { Button } from "../components/ui/Button";
import { StaggeredText } from "../components/ui/StaggeredText";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { room } from "../lib/moods";
import { useComposerStore } from "../store/composerStore";

interface Receipt {
  deliveryMethod?: "email" | "link";
  messageUrl?: string;
  mood?: TemplateId;
  /** True when the composer already played the sealing; the envelope arrives closed. */
  sealed?: boolean;
}

function readReceipt(slug: string | undefined, state: unknown): Receipt | null {
  if (state) return state as Receipt;
  try {
    const stored = sessionStorage.getItem(`unsaid-receipt-${slug ?? ""}`);
    return stored ? (JSON.parse(stored) as Receipt) : null;
  } catch {
    return null;
  }
}

/**
 * The inverse of the reveal, and deliberately faster. Arriving from the composer the letter
 * is already sealed and simply comes to rest; arriving any other way, the closure presses on
 * once. Sending should feel like an ending, not a form submission.
 */
export function Success() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [receipt] = useState(() => readReceipt(slug, location.state));
  const emailDelivery = receipt?.deliveryMethod === "email";
  const reduced = useReducedMotion();
  const storeMood = useComposerStore((s) => s.mood);
  const mood = receipt?.mood ?? storeMood;
  const reset = useComposerStore((s) => s.reset);
  const [phase, setPhase] = useState<SealPhase>(reduced || receipt?.sealed ? "sealed" : "close");
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const linkInput = useRef<HTMLInputElement>(null);
  const canShare = typeof navigator.share === "function";
  // on phones sharing is the likelier gesture, so it leads there; desks copy first
  const [shareFirst] = useState(() => canShare && window.matchMedia("(pointer: coarse)").matches);

  const url = receipt?.messageUrl || `${window.location.origin}/m/${slug ?? ""}`;
  const r = room(mood);
  const [time] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );

  useEffect(() => {
    if (phase === "sealed") return;
    const timer = window.setTimeout(() => setPhase("sealed"), 500);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => {
      setCopied(false);
      setShareStatus("");
    }, 2200);
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

  function copyButton(variant: "primary" | "secondary") {
    return (
      <Button variant={variant} className="copy-link" onClick={copy}>
        <svg className="copy-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {copied ? <path d="M4 12l5 5 11-11" /> : <path d="M9 9h10v10H9zM5 15V5h10" />}
        </svg>
        {copied ? "Copied" : "Copy link"}
      </Button>
    );
  }

  return (
    <div className="shell" data-mood={mood} style={{ ["--room-glow" as string]: r.glow }}>
      <div className="glow" />

      <main className="success-page" data-arrived={receipt?.sealed ? "sealed" : "fresh"}>
        <SealEnvelope mood={mood} phase={phase} className="success-seal" />

        <div className="success-copy">
          <p className="t-label" style={{ color: "rgba(200,169,110,0.62)" }}>
            {emailDelivery ? "Sent" : "Link ready"} — {time}
          </p>

          <StaggeredText
            as="h1"
            className="t-h1 success-title"
            text={
              emailDelivery
                ? "It’s out of\nyour hands now."
                : "Your letter is sealed.\nPass it along."
            }
            emphasis={[1]}
            play
            startDelay={240}
          />

          <p
            className="measure-caption"
            style={{ color: "var(--text-dim)", marginBottom: "var(--s8)" }}
          >
            {emailDelivery
              ? "Their address was used for delivery and discarded. You can also share the link below."
              : "Copy the link and send it wherever you like. Anyone with the link can open your letter."}{" "}
            The letter expires in thirty days.
          </p>

          <div className="link-row" data-copied={copied}>
            <input
              ref={linkInput}
              aria-label="Letter link"
              readOnly
              value={url}
              onFocus={(event) => event.target.select()}
            />
            {shareFirst ? (
              <Button variant="primary" onClick={share}>
                Share letter
              </Button>
            ) : (
              copyButton("primary")
            )}
          </div>
          <output className="share-status t-caption">{shareStatus}</output>
          {shareFirst
            ? copyButton("secondary")
            : canShare && (
                <Button variant="secondary" onClick={share}>
                  Share letter
                </Button>
              )}

          <div className="hero-actions">
            <Link className="btn btn-secondary" to="/compose" onClick={reset}>
              Write another
            </Link>
            <Link className="btn btn-quiet" to="/">
              Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
