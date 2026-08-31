const STEPS = ["Mood", "Message", "Delivery", "Review"];

/**
 * A hairline, not a bar. Completed nodes stay gold so the flow reads as ground covered.
 *
 * The rail itself is decorative — the step is announced through a live region instead, so a
 * screen reader hears "Step 2 of 4: Message" on change rather than parsing a row of dots.
 */
export function ProgressRail({ step }: { step: number }) {
  const total = STEPS.length;
  const fill = ((step - 1) / (total - 1)) * 100;

  return (
    <div className="progress">
      <p className="sr-only" aria-live="polite">
        Step {step} of {total}: {STEPS[step - 1]}
      </p>

      <div className="progress-rail" aria-hidden="true">
        <span className="t-mono" style={{ color: "var(--gold)" }}>
          {String(step).padStart(2, "0")}
        </span>
        <div className="rail">
          <span className="rail-fill" style={{ width: `${fill}%` }} />
          {STEPS.map((name, i) => {
            const at = (i / (total - 1)) * 100;
            const state = i + 1 === step ? "is-current" : i + 1 < step ? "is-done" : "";
            return <span key={name} className={`rail-node ${state}`} style={{ left: `${at}%` }} />;
          })}
        </div>
        <span className="t-mono" style={{ color: "var(--text-mute)" }}>
          {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
