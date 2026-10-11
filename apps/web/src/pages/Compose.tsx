import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LivePreview } from "../components/composer/LivePreview";
import { MessageSheet } from "../components/composer/MessageSheet";
import { TemplatePicker } from "../components/composer/TemplatePicker";
import { SealEnvelope, type SealPhase } from "../components/envelope/SealEnvelope";
import { defaultHeading } from "../components/templates/LetterRoom";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { ProgressRail } from "../components/ui/ProgressRail";
import { StaggeredText } from "../components/ui/StaggeredText";
import { Toast, type ToastMessage } from "../components/ui/Toast";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { api } from "../lib/api";
import { ROOM_LIST, SAMPLE_MESSAGE, room } from "../lib/moods";
import { DURATION, EASE_ENTER } from "../lib/motion";
import { rovingIndex } from "../lib/roving";
import { useComposerStore } from "../store/composerStore";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Sealing beats, in ms from the press: tuck the letter, fold the flap, press the closure. */
const SEAL_BEATS: [SealPhase, number][] = [
  ["tuck", 80],
  ["close", 720],
  ["sealed", 1480],
];
const SEAL_DONE = 1950;
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const HEADINGS: Record<number, [string, string]> = {
  1: [
    "Start with a feeling.",
    "The room does half the work. Pick the one that matches what you have to say.",
  ],
  2: [
    "Write what you couldn't say.",
    "Eight hundred characters. Long enough to be honest, short enough to send.",
  ],
  3: ["Where should it arrive?", "Send it to their inbox, or make a link to share yourself."],
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
  const [seal, setSeal] = useState<SealPhase | null>(null);
  const sealTimers = useRef<number[]>([]);
  const swatchRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => () => sealTimers.current.forEach(window.clearTimeout), []);

  const r = room(store.mood);
  const roomHeading = defaultHeading(store.mood).replace(/\n/g, " ");
  const ownHeading = store.heading?.replace(/\s+/g, " ").trim() ?? "";
  const customHeading = ownHeading && ownHeading !== roomHeading ? ownHeading : null;
  const emailValid = EMAIL.test(store.recipientEmail.trim());
  const emailError =
    emailTouched && store.recipientEmail.trim() && !emailValid
      ? "That address looks unfinished. We only need it once."
      : null;

  const canAdvance =
    (store.step === 1 && Boolean(store.mood)) ||
    (store.step === 2 && store.message.trim().length > 0 && store.message.length <= 800) ||
    (store.step === 3 && (store.deliveryMethod === "link" || emailValid)) ||
    store.step === 4;

  // a disabled button says why, instead of leaving the writer to guess
  const blockedReason = canAdvance
    ? null
    : store.step === 2
      ? "Write a few words first."
      : store.recipientEmail.trim()
        ? "Check their email address to continue."
        : "Add their email address, or choose to share a link.";

  /** The ceremony and the request run together; whichever is slower sets the pace. */
  function playSeal() {
    if (reduced) {
      setSeal("sealed");
      return Promise.resolve();
    }
    setSeal("open");
    sealTimers.current = SEAL_BEATS.map(([phase, at]) =>
      window.setTimeout(() => setSeal(phase), at),
    );
    return wait(SEAL_DONE);
  }

  function onSwatchKey(event: React.KeyboardEvent, index: number) {
    const next = rovingIndex(event.key, index, ROOM_LIST.length);
    if (next === null) return;
    event.preventDefault();
    swatchRefs.current[next]?.focus();
    store.setMood(ROOM_LIST[next].id);
  }

  async function send() {
    if (store.isSubmitting) return;
    store.setSubmitting(true);
    store.setSubmitError(null);
    setToast(null);
    const ceremony = playSeal();
    try {
      const request = api.createMessage({
        template_id: store.mood,
        message: store.message.trim(),
        heading: customHeading ?? undefined,
        delivery_method: store.deliveryMethod,
        recipient_email: store.deliveryMethod === "email" ? store.recipientEmail.trim() : undefined,
        from_hint: store.fromHint.trim() || undefined,
        accent: store.accent ?? undefined,
      });
      const [result] = await Promise.all([request, ceremony]);
      const receipt = {
        deliveryMethod: store.deliveryMethod,
        messageUrl: result.message_url,
        mood: store.mood,
      };
      // a refresh on the success page loses router state; keep the receipt for this tab
      try {
        sessionStorage.setItem(`unsaid-receipt-${result.slug}`, JSON.stringify(receipt));
      } catch {}
      store.finish();
      navigate(`/success/${result.slug}`, { state: { ...receipt, sealed: true } });
    } catch (error) {
      for (const timer of sealTimers.current) window.clearTimeout(timer);
      setSeal(null);
      const detail = error instanceof Error ? error.message : "Could not send this letter.";
      store.setSubmitError(detail);
      setToast({
        id: Date.now(),
        tone: "error",
        title: store.deliveryMethod === "email" ? "That didn't send." : "The link wasn't created.",
        detail: `${detail} Your draft is still here.`,
        action: { label: "Try again", onClick: send },
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
            Unsaid<span className="wordmark-period">.</span>
          </button>
          <span>Nothing about you is saved</span>
        </header>

        <div className="compose-body" id="composer">
          <ProgressRail step={store.step} />

          {/* initial={false} — the first step is present on first paint. Only step-to-step
              changes animate, so a stalled enter tween can never hide the composer. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={store.step}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
              transition={{ duration: reduced ? 0.12 : 0.42, ease: EASE_ENTER }}
            >
              <header className="compose-intro">
                <StaggeredText as="h1" className="t-h1" text={heading} play delay={70} />
                <p>{sub}</p>
              </header>

              {store.step === 1 && <TemplatePicker value={store.mood} onChange={store.setMood} />}

              {store.step === 2 && (
                <div className="compose-split">
                  <div>
                    <MessageSheet
                      value={store.message}
                      onChange={store.setMessage}
                      moodName={r.name}
                      heading={store.heading}
                      roomHeading={roomHeading}
                      onHeadingChange={store.setHeading}
                    />
                    <div className="swatches" role="radiogroup" aria-label="Mood">
                      {ROOM_LIST.map((option, index) => (
                        <button
                          key={option.id}
                          ref={(el) => {
                            swatchRefs.current[index] = el;
                          }}
                          type="button"
                          role="radio"
                          aria-checked={option.id === store.mood}
                          aria-label={option.name}
                          tabIndex={option.id === store.mood ? 0 : -1}
                          className="swatch"
                          style={{ background: option.cardGradient }}
                          onClick={() => store.setMood(option.id)}
                          onKeyDown={(event) => onSwatchKey(event, index)}
                        />
                      ))}
                    </div>
                  </div>
                  <LivePreview
                    mood={store.mood}
                    message={store.message}
                    heading={store.heading}
                    fromHint={store.fromHint}
                    accent={store.accent}
                  />
                </div>
              )}

              {store.step === 3 && (
                <div className="compose-split">
                  <div className="delivery-form">
                    <fieldset className="delivery-options">
                      <legend>How would you like to deliver it?</legend>
                      <label className="delivery-option">
                        <input
                          type="radio"
                          name="delivery"
                          value="email"
                          checked={store.deliveryMethod === "email"}
                          onChange={() => store.setDeliveryMethod("email")}
                        />
                        <span>
                          <strong>
                            Send by email <small>Recommended</small>
                          </strong>
                          <span>We deliver the letter straight to their inbox.</span>
                        </span>
                      </label>
                      <label className="delivery-option">
                        <input
                          type="radio"
                          name="delivery"
                          value="link"
                          checked={store.deliveryMethod === "link"}
                          onChange={() => store.setDeliveryMethod("link")}
                        />
                        <span>
                          <strong>Share a link</strong>
                          <span>No email needed. Copy the link and share it yourself.</span>
                        </span>
                      </label>
                    </fieldset>
                    <AnimatePresence initial={false}>
                      {store.deliveryMethod === "email" && (
                        <motion.div
                          className="field-reveal"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: DURATION.ui, ease: EASE_ENTER }}
                        >
                          <Field
                            label="Their email"
                            type="email"
                            inputMode="email"
                            autoComplete="off"
                            value={store.recipientEmail}
                            error={emailError}
                            valid={emailValid}
                            hint="Used once, for delivery. Never stored, never shown to them as yours."
                            onBlur={() => setEmailTouched(true)}
                            onChange={(e) => store.setRecipientEmail(e.target.value)}
                            placeholder="their@email.com"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                    heading={store.heading}
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
                        <EditStep step={1} label="mood" />
                      </dd>
                    </div>
                    <div className="review-row">
                      <dt>{store.deliveryMethod === "email" ? "Arrives at" : "Delivery"}</dt>
                      <dd>
                        {store.deliveryMethod === "email"
                          ? store.recipientEmail.trim()
                          : "A link for you to copy and share. No email will be sent."}
                        <EditStep step={3} label="delivery" />
                      </dd>
                    </div>
                    <div className="review-row">
                      <dt>Heading</dt>
                      <dd>
                        {customHeading ?? roomHeading}
                        <EditStep step={2} label="heading" />
                      </dd>
                    </div>
                    <div className="review-row">
                      <dt>Signed</dt>
                      <dd>
                        {store.fromHint.trim() || r.signature}
                        <EditStep step={3} label="signature" />
                      </dd>
                    </div>
                    <div className="review-row">
                      <dt>Length</dt>
                      <dd>
                        {store.message.trim().length} characters
                        <EditStep step={2} label="message" />
                      </dd>
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
                    heading={store.heading}
                    fromHint={store.fromHint}
                    accent={store.accent}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {store.step === 4 && store.submitError && !store.isSubmitting && (
            <p className="compose-error">
              {store.deliveryMethod === "email" ? "That didn’t send" : "The link wasn’t created"}:{" "}
              {store.submitError} Your draft is still here.
            </p>
          )}
          <div className="compose-actions">
            {/* step one has nowhere to go back to; the slot holds so Continue never jumps */}
            <Button
              variant="secondary"
              className="compose-back"
              hidden={store.step === 1}
              disabled={store.isSubmitting}
              onClick={store.back}
            >
              Back
            </Button>

            {store.step < 4 ? (
              <div className="compose-next">
                <Button
                  disabled={!canAdvance}
                  aria-describedby={blockedReason ? "compose-blocked" : undefined}
                  onClick={() => {
                    if (store.step === 3) setEmailTouched(true);
                    store.next();
                  }}
                >
                  Continue
                </Button>
                {blockedReason && (
                  <p className="compose-blocked" id="compose-blocked">
                    {blockedReason}
                  </p>
                )}
              </div>
            ) : (
              <Button loading={store.isSubmitting} onClick={send}>
                {store.deliveryMethod === "email"
                  ? store.isSubmitting
                    ? "Sending"
                    : "Send by email"
                  : store.isSubmitting
                    ? "Creating link"
                    : "Create share link"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {seal && (
            <motion.div
              className="seal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.ui, ease: EASE_ENTER }}
            >
              <SealEnvelope mood={store.mood} phase={seal} />
              <output>
                {seal !== "sealed"
                  ? "Sealing your letter…"
                  : store.deliveryMethod === "email"
                    ? "Sealed. On its way…"
                    : "Sealed. Making your link…"}
              </output>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function EditStep({ step, label }: { step: 1 | 2 | 3; label: string }) {
  const setStep = useComposerStore((s) => s.setStep);
  return (
    <button type="button" className="review-edit" onClick={() => setStep(step)}>
      Edit<span className="sr-only"> {label}</span>
    </button>
  );
}
