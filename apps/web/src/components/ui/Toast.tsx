import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DURATION, EASE_ENTER } from "../../lib/motion";

export interface ToastMessage {
  id: number;
  tone: "error" | "success";
  title: string;
  detail?: string;
  /** One recovery action, e.g. "Try again" after a failed send. */
  action?: { label: string; onClick: () => void };
}

/**
 * Bottom-centre, one at a time; a second replaces the first. `role="status"` for success,
 * `alert` for errors, so a screen reader hears the send confirmation without interruption
 * but is interrupted by a failure.
 *
 * It leaves on its own after five seconds, unless the pointer or focus is resting on it.
 * Framer's MotionConfig (App) reduces the slide to a fade for reduced motion.
 */
export function Toast({ toast, onDismiss }: { toast: ToastMessage | null; onDismiss: () => void }) {
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!toast || held) return;
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [toast, held, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          className={`toast toast-${toast.tone}`}
          role={toast.tone === "error" ? "alert" : "status"}
          initial={{ opacity: 0, y: 16, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 8, x: "-50%" }}
          transition={{ duration: DURATION.ui, ease: EASE_ENTER }}
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
        >
          <Icon tone={toast.tone} />
          <div className="toast-body">
            <p className="toast-title">{toast.title}</p>
            {toast.detail && <p className="toast-detail">{toast.detail}</p>}
            {toast.action && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  onDismiss();
                  toast.action?.onClick();
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
          <button type="button" className="toast-close" onClick={onDismiss} aria-label="Dismiss">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Icon({ tone }: { tone: "error" | "success" }) {
  const color = tone === "error" ? "var(--error)" : "var(--success)";
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "none", marginTop: 3 }}
      aria-hidden="true"
    >
      {tone === "error" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6M12 16.5v.01" />
        </>
      ) : (
        <path d="M4 12l5 5 11-11" />
      )}
    </svg>
  );
}
