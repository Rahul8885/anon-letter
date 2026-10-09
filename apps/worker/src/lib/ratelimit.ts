export const MAX_PER_HOUR = 5;
const WINDOW_MS = 60 * 60 * 1000;

export async function checkRateLimit(
  db: D1Database,
  ip: string,
  salt = "",
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const ipHash = await hashIp(ip, salt);
  const windowStart = Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS;

  // one atomic statement, so two concurrent sends can't both read a stale count
  const row = await db
    .prepare(
      `INSERT INTO rate_limits (ip_hash, window_start, count)
       VALUES (?, ?, 1)
       ON CONFLICT(ip_hash, window_start)
       DO UPDATE SET count = count + 1
       RETURNING count`,
    )
    .bind(ipHash, windowStart)
    .first<{ count: number }>();

  if (row && row.count > MAX_PER_HOUR) {
    return {
      allowed: false,
      retryAfter: Math.ceil((windowStart + WINDOW_MS - Date.now()) / 1000),
    };
  }

  return { allowed: true };
}

/** Windows older than the current one are never read again. */
export function staleWindowCutoff(now = Date.now()): number {
  return Math.floor(now / WINDOW_MS) * WINDOW_MS - WINDOW_MS;
}

async function hashIp(ip: string, salt: string): Promise<string> {
  const encoded = new TextEncoder().encode(`${salt}:${ip}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
