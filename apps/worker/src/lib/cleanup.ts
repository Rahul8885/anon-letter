import { staleWindowCutoff } from "./ratelimit";

/** Daily cron: hard-delete expired letters and rate-limit windows that can no longer matter. */
export async function purgeExpired(db: D1Database, now = Date.now()) {
  const [letters, windows] = await db.batch([
    db.prepare("DELETE FROM messages WHERE expires_at < ?").bind(Math.floor(now / 1000)),
    db.prepare("DELETE FROM rate_limits WHERE window_start < ?").bind(staleWindowCutoff(now)),
  ]);
  return { letters: letters.meta.changes, windows: windows.meta.changes };
}
