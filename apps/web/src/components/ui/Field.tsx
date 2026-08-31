import { useId } from "react";
import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
}

/**
 * Underline only. No boxes anywhere in the composer — the only rectangle on screen
 * should be the letter itself. Placeholders are never labels.
 */
export function Field({ label, error, hint, id, ...rest }: Props) {
  const auto = useId();
  const inputId = id ?? auto;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const described = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  return (
    <div className="field">
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className="field-input"
        aria-invalid={error ? true : undefined}
        aria-describedby={described || undefined}
        {...rest}
      />
      {hint && !error && (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
