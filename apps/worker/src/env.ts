export interface Env {
  DB: D1Database;
  /** Public URL of the web app; letter links are built as `${PUBLIC_BASE_URL}/m/<slug>`. */
  PUBLIC_BASE_URL: string;
  /** Comma-separated list of origins allowed to call the API cross-origin. */
  ALLOWED_ORIGINS: string;
  /** Sender shown on delivery emails, e.g. `Unsaid <letters@yourdomain.com>`. Must be a Resend-verified domain. */
  EMAIL_FROM: string;
  /** `resend` sends real email; `log` prints the letter link to the console instead (local dev). */
  EMAIL_MODE?: "resend" | "log";
  /** Secret. Required when EMAIL_MODE is `resend`. */
  RESEND_API_KEY?: string;
  /** Secret. Mixed into IP hashes so stored rate-limit keys can't be reversed by brute force. */
  IP_HASH_SALT?: string;
}
