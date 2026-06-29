import { TEMPLATE_LIST } from "@anonletter/shared";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LivePreview } from "../components/templates/LivePreview";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { useComposerStore } from "../store/composerStore";

export function Compose() {
  const store = useComposerStore();
  const navigate = useNavigate();
  const template = TEMPLATE_LIST.find((item) => item.id === store.selectedTemplate) ?? TEMPLATE_LIST[2];
  const canContinue =
    (store.step === 1 && store.selectedTemplate) ||
    (store.step === 2 && store.message.trim().length > 0) ||
    (store.step === 3 && store.recipientEmail.trim().length > 0);

  async function submit() {
    store.setSubmitting(true);
    store.setSubmitError(null);

    try {
      const result = await api.createMessage({
        template_id: store.selectedTemplate,
        message: store.message,
        recipient_email: store.recipientEmail,
        from_hint: store.fromHint || undefined
      });
      store.setSentSlug(result.slug);
      navigate(`/success/${result.slug}`);
    } catch (error) {
      store.setSubmitError(error instanceof Error ? error.message : "Could not send this letter.");
    } finally {
      store.setSubmitting(false);
    }
  }

  return (
    <main className="compose-shell">
      <header className="compose-header">
        <button className="wordmark-button" onClick={() => navigate("/")}>
          AnonLetter
        </button>
        <span>Step {store.step} of 4</span>
      </header>
      <div className="compose-grid">
        <section className="composer-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={store.step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              {store.step === 1 && (
                <>
                  <p className="section-label">Choose the feeling</p>
                  <h1>Start with a mood.</h1>
                  <div className="compose-template-list">
                    {TEMPLATE_LIST.map((item) => (
                      <button
                        className={item.id === store.selectedTemplate ? "selected" : ""}
                        key={item.id}
                        onClick={() => store.setSelectedTemplate(item.id)}
                      >
                        <span>{item.motif}</span>
                        <strong>{item.name}</strong>
                        <small>{item.tags.slice(0, 2).join(" / ")}</small>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {store.step === 2 && (
                <>
                  <p className="section-label">{template.name}</p>
                  <h1>Write what they should read.</h1>
                  <textarea
                    maxLength={800}
                    value={store.message}
                    onChange={(event) => store.setMessage(event.target.value)}
                    placeholder="I wanted you to know..."
                  />
                  <p className="field-note">{800 - store.message.length} characters left</p>
                </>
              )}
              {store.step === 3 && (
                <>
                  <p className="section-label">Delivery</p>
                  <h1>Where should it arrive?</h1>
                  <label>
                    Recipient email
                    <input
                      type="email"
                      value={store.recipientEmail}
                      onChange={(event) => store.setRecipientEmail(event.target.value)}
                      placeholder="their@email.com"
                    />
                  </label>
                  <label>
                    Optional hint
                    <input
                      value={store.fromHint}
                      maxLength={60}
                      onChange={(event) => store.setFromHint(event.target.value)}
                      placeholder="from someone in your orbit"
                    />
                  </label>
                </>
              )}
              {store.step === 4 && (
                <>
                  <p className="section-label">Review</p>
                  <h1>Ready to send?</h1>
                  <div className="review-list">
                    <p>
                      <span>Template</span>
                      {template.name}
                    </p>
                    <p>
                      <span>Recipient</span>
                      {store.recipientEmail}
                    </p>
                    <p>
                      <span>Anonymity</span>
                      Sender hidden, recipient email not stored
                    </p>
                  </div>
                  {store.submitError && <p className="form-error">{store.submitError}</p>}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="compose-actions">
            <Button
              variant="secondary"
              disabled={store.step === 1 || store.isSubmitting}
              onClick={() => store.setStep(Math.max(1, store.step - 1))}
            >
              Back
            </Button>
            {store.step < 4 ? (
              <Button
                disabled={!canContinue}
                onClick={() => store.setStep(Math.min(4, store.step + 1))}
              >
                Continue
              </Button>
            ) : (
              <Button disabled={store.isSubmitting} onClick={submit}>
                {store.isSubmitting ? "Sending..." : "Send anonymously"}
              </Button>
            )}
          </div>
        </section>
        <LivePreview
          templateId={store.selectedTemplate}
          message={store.message}
          fromHint={store.fromHint}
        />
      </div>
    </main>
  );
}
