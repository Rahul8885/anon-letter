import { type ApiError, type Message, TEMPLATES } from "@anonletter/shared";
import { type Context, Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Env } from "../env";
import { sendLetterEmail } from "../lib/email";
import { checkRateLimit } from "../lib/ratelimit";
import { generateSlug, isValidSlug } from "../lib/slug";
import { CreateMessageSchema, firstIssue } from "../lib/validate";

const LETTER_TTL_SECONDS = 30 * 24 * 60 * 60;
const SLUG_ATTEMPTS = 3;

export const messages = new Hono<{ Bindings: Env }>();

function fail(
  c: Context<{ Bindings: Env }>,
  status: ContentfulStatusCode,
  code: ApiError["code"],
  error: string,
  headers?: Record<string, string>,
) {
  return c.json<ApiError>({ success: false, code, error }, status, headers);
}

function baseUrl(env: Env) {
  return env.PUBLIC_BASE_URL.replace(/\/+$/, "");
}

messages.get("/templates/all", (c) => c.json({ success: true, data: Object.values(TEMPLATES) }));

// POST /api/messages — store the letter, then deliver it by email or hand back a share link
messages.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = CreateMessageSchema.safeParse(body);
  if (!parsed.success) return fail(c, 400, "VALIDATION_ERROR", firstIssue(parsed.error));

  const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
  const limit = await checkRateLimit(c.env.DB, ip, c.env.IP_HASH_SALT);
  if (!limit.allowed) {
    return fail(c, 429, "RATE_LIMITED", "Too many letters. Try again later.", {
      "Retry-After": String(limit.retryAfter ?? 3600),
    });
  }

  // recipient_email is deliberately left out of everything below except sendLetterEmail
  const input = parsed.data;
  const now = Math.floor(Date.now() / 1000);
  const id = crypto.randomUUID();

  let slug = "";
  for (let attempt = 1; !slug; attempt++) {
    const candidate = generateSlug();
    try {
      await c.env.DB.prepare(
        `INSERT INTO messages
          (id, slug, template_id, message, from_hint, bg_color, accent, font_key, heading, status, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'sent', ?, ?)`,
      )
        .bind(
          id,
          candidate,
          input.template_id,
          input.message,
          input.from_hint ?? null,
          input.bg_color ?? null,
          input.accent ?? null,
          input.font_key ?? null,
          input.heading ?? null,
          now + LETTER_TTL_SECONDS,
          now,
        )
        .run();
      slug = candidate;
    } catch (error) {
      const collided = String((error as Error).message).includes("UNIQUE");
      if (!collided || attempt >= SLUG_ATTEMPTS) throw error;
    }
  }

  if (input.delivery_method === "email" && input.recipient_email) {
    const sent = await sendLetterEmail({
      mode: c.env.EMAIL_MODE === "log" ? "log" : "resend",
      apiKey: c.env.RESEND_API_KEY,
      from: c.env.EMAIL_FROM,
      to: input.recipient_email,
      slug,
      templateId: input.template_id,
      fromHint: input.from_hint,
      baseUrl: baseUrl(c.env),
    });

    if (!sent.ok) {
      // an undelivered letter has no reader; don't leave it behind
      console.error(`[email] delivery failed for ${slug}: ${sent.reason}`);
      await c.env.DB.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
      return fail(c, 502, "INTERNAL_ERROR", "We couldn't deliver that letter. Nothing was sent.");
    }
  }

  return c.json({ success: true, slug, message_url: `${baseUrl(c.env)}/m/${slug}` }, 201);
});

// GET /api/messages/:slug — the recipient opens the letter; first open marks it read
messages.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  if (!isValidSlug(slug)) return fail(c, 404, "NOT_FOUND", "Letter not found.");

  const row = await c.env.DB.prepare(
    `SELECT slug, template_id, message, heading, from_hint, bg_color, accent, font_key,
            status, read_at, expires_at, created_at
     FROM messages WHERE slug = ?`,
  )
    .bind(slug)
    .first<Omit<Message, "id">>();

  if (!row) return fail(c, 404, "NOT_FOUND", "Letter not found.");

  const now = Math.floor(Date.now() / 1000);
  if (row.expires_at < now || row.status === "expired") {
    return fail(c, 410, "EXPIRED", "This letter has expired.");
  }

  if (!row.read_at) {
    // a reported letter keeps its 'reported' status; it only gains a read time
    await c.env.DB.prepare(
      `UPDATE messages
       SET read_at = ?, status = CASE WHEN status = 'sent' THEN 'read' ELSE status END
       WHERE slug = ? AND read_at IS NULL`,
    )
      .bind(now, slug)
      .run();
    row.read_at = now;
    if (row.status === "sent") row.status = "read";
  }

  c.header("Cache-Control", "no-store");
  return c.json({ success: true, data: row });
});

// POST /api/messages/:slug/report — no auth; idempotent so a double-tap never shows an error
messages.post("/:slug/report", async (c) => {
  const slug = c.req.param("slug");
  if (!isValidSlug(slug)) return fail(c, 404, "NOT_FOUND", "Letter not found.");

  const now = Math.floor(Date.now() / 1000);
  const result = await c.env.DB.prepare(
    "UPDATE messages SET status = 'reported', report_at = ? WHERE slug = ? AND status != 'reported'",
  )
    .bind(now, slug)
    .run();

  if (result.meta.changes === 0) {
    const exists = await c.env.DB.prepare("SELECT 1 AS found FROM messages WHERE slug = ?")
      .bind(slug)
      .first();
    if (!exists) return fail(c, 404, "NOT_FOUND", "Letter not found.");
  }

  return c.json({ success: true });
});
