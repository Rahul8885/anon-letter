import type { Message as MessageData, TemplateId } from "@anonletter/shared";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Envelope } from "../components/envelope/Envelope";
import { LetterLead, LetterRoom } from "../components/templates/LetterRoom";
import { Button } from "../components/ui/Button";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useTypewriter } from "../hooks/useTypewriter";
import { api } from "../lib/api";
import { SAMPLE_MESSAGE, room } from "../lib/moods";
import { useComposerStore } from "../store/composerStore";

type Data = Omit<MessageData, "id">;

/** The reveal timeline, in ms. Absolute cues on one clock, per DESIGN.md. */
const CUE = {
  envelope: 1200,
  seal: 2600,
  flap: 3000,
  letter: 3900,
  greeting: 4600,
  typing: 5000,
};

export function Message() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    // /m/demo renders a local sample so the reveal can be reviewed without a backend
    if (slug === "demo" || slug.startsWith("demo-")) {
      const mood = (slug.replace("demo-", "") || "night-thought") as TemplateId;
      setData({
        slug,
        template_id: SAMPLE_MESSAGE[mood] ? mood : "night-thought",
        message: SAMPLE_MESSAGE[SAMPLE_MESSAGE[mood] ? mood : "night-thought"],
        from_hint: null,
        bg_color: null,
        accent: null,
        font_key: null,
        status: "sent",
        read_at: null,
        expires_at: Math.floor(Date.now() / 1000) + 86400,
        created_at: Math.floor(Date.now() / 1000),
      });
      setLoading(false);
      return;
    }

    api
      .getMessage(slug)
      .then((result) => setData(result.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "This letter could not be opened."),
      )
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LetterLoading />;
  if (error) return <LetterError message={error} />;
  if (!data) return null;

  return <Reveal key={data.slug} data={data} />;
}

/* -------------------------------------------------------------------------- */

export function Reveal({ data, preview = false }: { data: Data; preview?: boolean }) {
  const reduced = useReducedMotion();
  const r = room(data.template_id);

  const [phase, setPhase] = useState(() => (reduced ? 6 : 0));
  const [reported, setReported] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const typing = useTypewriter(data.message, {
    start: phase >= 5,
    instant: reduced || phase >= 6,
    onDone: () => setPhase((p) => Math.max(p, 6)),
  });

  /** The ceremony is never a hostage: any tap or key jumps to the resting state. */
  const skip = useCallback(() => {
    setPhase(6);
    typing.skip();
  }, [typing]);

  useEffect(() => {
    if (reduced) return;
    const timers = [
      window.setTimeout(() => setPhase((p) => Math.max(p, 1)), CUE.envelope),
      window.setTimeout(() => setPhase((p) => Math.max(p, 2)), CUE.seal),
      window.setTimeout(() => setPhase((p) => Math.max(p, 3)), CUE.flap),
      window.setTimeout(() => setPhase((p) => Math.max(p, 4)), CUE.letter),
      window.setTimeout(() => setPhase((p) => Math.max(p, 5)), CUE.typing),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [reduced]);

  useEffect(() => {
    if (reduced || phase >= 6) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as Element)?.closest?.("[data-preview-controls]")) return;
      // let people tab through without detonating the sequence
      if (e.key === "Tab" || e.key === "Shift") return;
      skip();
    };
    const onPointer = (e: PointerEvent) => {
      if ((e.target as Element)?.closest?.("[data-preview-controls]")) return;
      skip();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [reduced, phase, skip]);

  async function report() {
    if (preview) {
      setReported(true);
      return;
    }
    setReporting(true);
    setReportError(null);
    try {
      await api.reportMessage(data.slug);
      setReported(true);
    } catch {
      setReportError("Could not report this letter. Please try again.");
    } finally {
      setReporting(false);
    }
  }

  const envelopeState = phase >= 3 ? "open" : phase >= 2 ? "opening" : "sealed";
  const letterOut = phase >= 4;
  const time = new Date(data.created_at * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <LetterRoom
      mood={data.template_id}
      eyebrow={`${r.name} — ${time}`}
      burst={phase >= 4}
      style={data.accent ? { ["--room-accent" as string]: data.accent } : undefined}
    >
      {/* the envelope owns the stage until the letter clears it, then unmounts */}
      {!reduced && phase < 5 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: "var(--z-fore)",
            display: "grid",
            placeItems: "center",
            opacity: phase >= 4 ? 0 : 1,
            transform: phase === 0 ? "translateY(-80px)" : "none",
            transition: "opacity 600ms var(--ease-object), transform 1.4s var(--ease-object)",
            pointerEvents: "none",
          }}
        >
          <Envelope state={envelopeState} size="clamp(240px, 34vw, 420px)" />
        </div>
      )}

      <div className="letter-stack">
        <LetterLead mood={data.template_id} show={letterOut} />

        <p
          className="letter-body"
          style={{
            opacity: letterOut ? 1 : 0,
            transition: "opacity 800ms var(--ease-enter)",
          }}
        >
          <span aria-hidden="true">{typing.visible}</span>
          <span className="sr-only">{data.message}</span>
          {phase >= 5 && !typing.done && <span className="caret" />}
        </p>

        <hr className="letter-rule" style={{ opacity: typing.done ? 1 : 0 }} />

        <p
          className="letter-sign"
          style={{ opacity: typing.done ? 1 : 0 }}
          aria-hidden={!typing.done}
        >
          — from {data.from_hint?.trim() || r.signature}
        </p>
      </div>

      <div
        className="room-rail"
        hidden={!typing.done}
        style={{
          opacity: typing.done ? 1 : 0,
          transition: "opacity 900ms var(--ease-enter)",
        }}
      >
        <output>
          {reportError ||
            (reported
              ? preview
                ? "Preview only · no report sent"
                : "Reported · thank you"
              : r.railNote)}
        </output>

        {/* no upsell, no modal — the reply lives in the rail, beside the report control */}
        <span className="room-rail-actions">
          <Link
            className="rail-link"
            to="/compose"
            onClick={preview ? undefined : () => useComposerStore.getState().reset()}
          >
            Write one back
          </Link>
          <button
            type="button"
            className="report-btn"
            onClick={report}
            disabled={reported || reporting}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
            </svg>
            {reported ? "Reported" : "Report"}
          </button>
        </span>
      </div>
    </LetterRoom>
  );
}

/* -------------------------------------------------------------------------- */

/** Skeleton parchment at letter measure. No spinners anywhere in the product. */
function LetterLoading() {
  return (
    <div className="state-page">
      <div style={{ display: "flex", flexDirection: "column", gap: 9, width: "min(280px, 70vw)" }}>
        {[78, 100, 92, 64].map((w) => (
          <span key={w} className="skeleton-line" style={{ width: `${w}%` }} />
        ))}
      </div>
      <p className="sr-only">Opening the letter</p>
    </div>
  );
}

function LetterError({ message }: { message: string }) {
  return (
    <div className="state-page">
      <h1 className="t-h1">This letter isn&rsquo;t here.</h1>
      <p className="measure-caption" style={{ color: "var(--text-dim)" }}>
        {message} Letters expire thirty days after they are sent, and a link only works once it has
        been created.
      </p>
      <Link to="/compose">
        <Button>Write one of your own</Button>
      </Link>
    </div>
  );
}
