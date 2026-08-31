import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export interface ToastMessage {
  id: number;
  tone: "error" | "success";
  title: string;
  detail?: string;
}

/**
 * Bottom-centre, one at a time; a second replaces the first. `role="status"` for success,
 * `alert` for errors, so a screen reader hears the send confirmation without interruption
 * but is interrupted by a failure.
 */
export function Toast({ toast, onDismiss }: { toast: ToastMessage | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

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
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <Icon tone={toast.tone} />
          <div>
            <p style={{ fontSize: "0.84rem", color: "var(--paper)" }}>{toast.title}</p>
            {toast.detail && (
              <p className="t-caption" style={{ color: "var(--text-mute)", marginTop: 4 }}>
                {toast.detail}
              </p>
            )}
          </div>
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
