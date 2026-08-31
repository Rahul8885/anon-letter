import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { useMagnetic } from "../../hooks/useMagnetic";

type Variant = "primary" | "secondary" | "quiet" | "room" | "room-quiet";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  /** Magnetic pull is a shell gesture; rooms keep their buttons still. */
  magnetic?: boolean;
}

export function Button({
  children,
  variant = "primary",
  loading,
  magnetic,
  className,
  disabled,
  ...rest
}: PropsWithChildren<Props>) {
  const isShell = variant === "primary" || variant === "secondary";
  const ref = useMagnetic<HTMLButtonElement>(magnetic ?? isShell);

  return (
    <button
      ref={ref}
      type="button"
      className={`btn btn-${variant} ${loading ? "btn-loading" : ""} ${className ?? ""}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span className="btn-label">{children}</span>
    </button>
  );
}
