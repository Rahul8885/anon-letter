import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LivePreview } from "../components/composer/LivePreview";
import { MessageSheet } from "../components/composer/MessageSheet";
import { TemplatePicker } from "../components/composer/TemplatePicker";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { ProgressRail } from "../components/ui/ProgressRail";
import { Toast, type ToastMessage } from "../components/ui/Toast";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { api } from "../lib/api";
import { ROOM_LIST, SAMPLE_MESSAGE, room } from "../lib/moods";
import { useComposerStore } from "../store/composerStore";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const HEADINGS: Record<number, [string, string]> = {
  1: [
    "Start with a feeling.",
    "The room does half the work. Pick the one that matches what you have to say.",
  ],
  2: [
    "Write what you couldn't say.",
    "Eight hundred characters. Long enough to be honest, short enough to send.",
  ],
  3: [
    "Where should it arrive?",
    "Their address goes straight to delivery. It is never written to our database.",
  ],
  4: ["Read it once more.", "After this it belongs to them, and there is no way to take it back."],
};

export function Compose() {
  const store = useComposerStore();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [params] = useSearchParams();

  // Dev-only: ?step=2&mood=old-letter jumps straight to a step so each can be reviewed in
  // isolation. Seeded before first paint, not in an effect — changing `step` after mount
  // restarts the AnimatePresence swap and the step renders mid-transition. Stripped from
  // production builds; the real flow is always gated by validation.
  useState(() => {
    if (!import.meta.env.DEV) return null;
    const devMood = params.get("mood") as typeof store.mood | null;
    const devStep = Number(params.get("step"));
    if (devMood) useComposerStore.setState({ mood: devMood });
    if (devStep >= 1 && devStep <= 4) {
      useComposerStore.setState((prev) => ({
        step: devStep as 1 | 2 | 3 | 4,
        message: prev.message || SAMPLE_MESSAGE[devMood ?? prev.mood],
        recipientEmail: prev.recipientEmail || "rue@example.com",
      }));
    }
    return null;
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);

  const r = room(store.mood);
  const emailValid = EMAIL.test(store.recipientEmail.trim());
  const emailError =
    emailTouched && store.recipientEmail.trim() && !emailValid
      ? "That address looks unfinished. We only need it once."
      : null;

  const canAdvance =
    (store.step === 1 && Boolean(store.mood)) ||
    (store.step === 2 && store.message.trim().length > 0 && store.message.length <= 800) ||
    (store.step === 3 && emailValid) ||
    store.step === 4;

  async function send() {
    store.setSubmitting(true);
    store.setSubmitError(null);
    try {
      const result = await api.createMessage({
        template_id: store.mood,
        message: store.message.trim(),
        recipient_email: store.recipientEmail.trim(),
        from_hint: store.fromHint.trim() || undefined,
        accent: store.accent ?? undefined,
      });
      navigate(`/success/${result.slug}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Could not send this letter.";
      store.setSubmitError(detail);
      setToast({
        id: Date.now(),
        tone: "error",
        title: "That didn't send.",
        detail: `${detail} Your draft is still here.`,
      });
    } finally {
      store.setSubmitting(false);
    }
  }

  const [heading, sub] = HEADINGS[store.step];

  return (
    <div className="shell" style={{ ["--room-glow" as string]: r.glow }}>
      <a className="skip-link" href="#composer">
        Skip to the composer
      </a>
      <div className="glow" />

      <div className="compose-shell">
        <header className="topbar">
          <button type="button" className="wordmark" onClick={() => navigate("/")}>
            AnonLetter
          </button>
          <span>Nothing about you is saved</span>
        </header>

        <div className="compose-body" id="composer">
          <div style={{ marginBottom: "var(--s12)" }}>
            <ProgressRail step={store.step} />
          </div>

          {/* initial={false} — the first step is present on first paint. Only step-to-step
              changes animate, so a stalled enter tween can never hide the composer. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={store.step}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
              transition={{ duration: reduced ? 0.12 : 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="t-h1" style={{ marginBottom: "var(--s3)" }}>
                {heading}
              </h1>
              <p
                className="measure-prose"
                style={{ color: "var(--text-dim)", marginBottom: "var(--s12)" }}
              >
                {sub}
              </p>

              {store.step === 1 && <TemplatePicker value={store.mood} onChange={store.setMood} />}

              {store.step === 2 && (
                <div className="compose-split">
                  <div>
                    <MessageSheet
                      value={store.message}
                      onChange={store.setMessage}
                      moodName={r.name}
                    />
                    <div
                      className="swatches"
                      style={{ marginTop: "var(--s6)" }}
                      role="radiogroup"
                      aria-label="Mood"
                    >
                      {ROOM_LIST.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          role="radio"
                          aria-checked={option.id === store.mood}
                          aria-label={option.name}
                          className="swatch"
                          style={{ background: option.cardGradient }}
                          onClick={() => store.setMood(option.id)}
                        />
                      ))}
                    </div>
                  </div>
                  <LivePreview
                    mood={store.mood}
                    message={store.message}
                    fromHint={store.fromHint}
                    accent={store.accent}
                  />
                </div>
              )}

              {store.step === 3 && (
                <div className="compose-split">
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--s8)" }}>
                    <Field
                      label="Their email"
                      type="email"
                      inputMode="email"
                      autoComplete="off"
                      value={store.recipientEmail}
                      error={emailError}
                      hint="Used once, for delivery. Never stored, never shown to them as yours."
                      onBlur={() => setEmailTouched(true)}
                      onChange={(e) => store.setRecipientEmail(e.target.value)}
                      placeholder="their@email.com"
                    />
                    <Field
                      label="Sign it (optional)"
                      maxLength={60}
                      value={store.fromHint}
                      hint="A hint, not a name. Left blank, it signs itself."
                      onChange={(e) => store.setFromHint(e.target.value)}
                      placeholder={r.signature}
                    />
                  </div>
                  <LivePreview
                    mood={store.mood}
                    message={store.message}
                    fromHint={store.fromHint}
                    accent={store.accent}
                  />
                </div>
              )}

              {store.step === 4 && (
                <div className="compose-split">
                  <dl style={{ margin: 0 }}>
                    <div className="review-row">
                      <dt>Mood</dt>
                      <dd>
                        {r.name} — {r.useCase.toLowerCase()}
                      </dd>
                    </div>
                    <div className="review-row">
                      <dt>Arrives at</dt>
                      <dd>{store.recipientEmail.trim()}</dd>
                    </div>
                    <div className="review-row">
                      <dt>Signed</dt>
                      <dd>{store.fromHint.trim() || r.signature}</dd>
                    </div>
                    <div className="review-row">
                      <dt>Length</dt>
                      <dd>{store.message.trim().length} characters</dd>
                    </div>
                    <div className="review-row" style={{ borderBottom: "none" }}>
                      <dt>Kept</dt>
                      <dd>
                        The letter and its link, for 30 days. Not their address, and nothing about
                        you.
                      </dd>
                    </div>
                  </dl>
                  <LivePreview
                    mood={store.mood}
                    message={store.message}
                    fromHint={store.fromHint}
                    accent={store.accent}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="compose-actions">
            <Button
              variant="secondary"
              disabled={store.step === 1 || store.isSubmitting}
              onClick={store.back}
            >
              Back
            </Button>

            {store.step < 4 ? (
              <Button
                disabled={!canAdvance}
                onClick={() => {
                  if (store.step === 3) setEmailTouched(true);
                  store.next();
                }}
              >
                Continue
              </Button>
            ) : (
              <Button loading={store.isSubmitting} onClick={send}>
                {store.isSubmitting ? "Sending" : "Send it"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
