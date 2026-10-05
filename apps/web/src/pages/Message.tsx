import type { Message as MessageData, TemplateId } from "@anonletter/shared";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TactileLetter } from "../components/envelope/TactileLetter";
import { LetterLead, LetterRoom } from "../components/templates/LetterRoom";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useTypewriter } from "../hooks/useTypewriter";
import { RequestError, api } from "../lib/api";
import { SAMPLE_MESSAGE, room } from "../lib/moods";
import { useComposerStore } from "../store/composerStore";

type Data = Omit<MessageData, "id">;

export function Message() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt re-runs the fetch on retry
  useEffect(() => {
    if (!slug) return;

    if (slug === "demo" || slug.startsWith("demo-")) {
      const mood = (slug.replace("demo-", "") || "night-thought") as TemplateId;
      const templateId = SAMPLE_MESSAGE[mood] ? mood : "night-thought";
      setData({
        slug,
        template_id: templateId,
        message: SAMPLE_MESSAGE[templateId],
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

    setLoading(true);
    setError(null);
    api
      .getMessage(slug)
      .then((result) => setData(result.data))
      .catch((err) =>
        setError({
          message: err instanceof Error ? err.message : "This letter could not be opened.",
          retryable: err instanceof RequestError && err.retryable,
        }),
      )
      .finally(() => setLoading(false));
  }, [slug, attempt]);

  if (loading) return <LetterLoading />;
  if (error)
    return (
      <LetterError
        message={error.message}
        onRetry={error.retryable ? () => setAttempt((n) => n + 1) : undefined}
      />
    );
  if (!data) return null;
  return <Reveal key={data.slug} data={data} />;
}

export function Reveal({ data, preview = false }: { data: Data; preview?: boolean }) {
  const reduced = useReducedMotion();
  const r = room(data.template_id);
  const [opened, setOpened] = useState(reduced);
  const [instant, setInstant] = useState(reduced);
  const [reported, setReported] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const handleOpened = useCallback(() => setOpened(true), []);
  const handleSkip = useCallback(() => {
    setInstant(true);
    setOpened(true);
  }, []);

  const typing = useTypewriter(data.message, {
    start: opened,
    instant: reduced || instant,
  });

  const finished = typing.done || instant || reduced;
  const visible = instant || reduced ? data.message : typing.visible;

  useEffect(() => {
    if (!opened || finished) return;
    const skip = () => typing.skip();
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [opened, finished, typing.skip]);

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

  return (
    <LetterRoom
      mood={data.template_id}
      burst={opened}
      className="room-tactile"
      style={data.accent ? { ["--room-accent" as string]: data.accent } : undefined}
    >
      <TactileLetter mood={data.template_id} onOpened={handleOpened} onSkip={handleSkip}>
        <div className="letter-stack">
          <LetterLead mood={data.template_id} show={opened} />
          <p className="letter-body">
            <span aria-hidden="true">{visible}</span>
            <span className="sr-only">{data.message}</span>
            {opened && !finished && <span className="caret" />}
          </p>
          {opened && !finished && (
            <button type="button" className="letter-reading-skip" onClick={typing.skip}>
              Read the whole letter
            </button>
          )}
          <hr className="letter-rule" style={{ opacity: finished ? 1 : 0 }} />
          <p className="letter-sign" style={{ opacity: finished ? 1 : 0 }} aria-hidden={!finished}>
            — from {data.from_hint?.trim() || r.signature}
          </p>
        </div>
      </TactileLetter>

      <div className="room-rail" hidden={!finished} style={{ opacity: finished ? 1 : 0 }}>
        <output>
          {reportError ||
            (reported
              ? preview
                ? "Preview only · no report sent"
                : "Reported · thank you"
              : r.railNote)}
        </output>
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
            {reported ? "Reported" : reporting ? "Reporting…" : "Report"}
          </button>
        </span>
      </div>
    </LetterRoom>
  );
}

function LetterLoading() {
  return (
    <div className="state-page">
      <div className="loading-letter">
        {[78, 100, 92, 64].map((width) => (
          <span key={width} className="skeleton-line" style={{ width: `${width}%` }} />
        ))}
      </div>
      <p className="sr-only">Opening the letter</p>
    </div>
  );
}

/** Two different failures: the letter is gone (final), or we couldn't reach it (retry). */
function LetterError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-page">
      {onRetry ? (
        <>
          <h1 className="t-h1">The letter didn&rsquo;t arrive.</h1>
          <p className="measure-caption">
            {message} It&rsquo;s still waiting for you &mdash; check your connection and try again.
          </p>
          <div className="state-actions">
            <button type="button" className="btn btn-primary" onClick={onRetry}>
              Try again
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="t-h1">This letter isn&rsquo;t here.</h1>
          <p className="measure-caption">
            {message} Letters expire thirty days after they are sent, and a link only works once it
            has been created.
          </p>
          <div className="state-actions">
            <Link className="btn btn-primary" to="/compose">
              Write one of your own
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
