import { TEMPLATES, type Message } from "@anonletter/shared";
import { Hono } from "hono";
import type { Env } from "../env";
import { sendLetterEmail } from "../lib/email";
import { checkRateLimit } from "../lib/ratelimit";
import { generateSlug } from "../lib/slug";
import { CreateMessageSchema } from "../lib/validate";

export const messages = new Hono<{ Bindings: Env }>();

messages.get("/templates/all", (c) => c.json({ success: true, data: Object.values(TEMPLATES) }));

messages.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = CreateMessageSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ success: false, code: "VALIDATION_ERROR", error: parsed.error.message }, 400);
  }

  const ip = c.req.header("CF-Connecting-IP") ?? c.req.header("x-forwarded-for") ?? "unknown";
  const limit = await checkRateLimit(c.env.DB, ip);
  if (!limit.allowed) {
    return c.json(
      { success: false, code: "RATE_LIMITED", error: "Too many letters. Try again later." },
      429,
      { "Retry-After": String(limit.retryAfter ?? 3600) }
    );
  }

  const input = parsed.data;
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 30 * 24 * 60 * 60;
  const id = crypto.randomUUID();
  const slug = generateSlug();

  await c.env.DB.prepare(
    `INSERT INTO messages
      (id, slug, template_id, message, from_hint, bg_color, accent, font_key, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      slug,
      input.template_id,
      input.message,
      input.from_hint ?? null,
      input.bg_color ?? null,
      input.accent ?? null,
      input.font_key ?? null,
      expiresAt,
      now
    )
    .run();

  await sendLetterEmail({
    apiKey: c.env.RESEND_API_KEY,
    to: input.recipient_email,
    slug,
    templateId: input.template_id,
    fromHint: input.from_hint,
    baseUrl: c.env.PUBLIC_BASE_URL
  });

  return c.json({ success: true, slug, message_url: `${c.env.PUBLIC_BASE_URL}/m/${slug}` });
});

messages.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const row = await c.env.DB.prepare("SELECT * FROM messages WHERE slug = ?").bind(slug).first<Message>();

  if (!row) {
    return c.json({ success: false, code: "NOT_FOUND", error: "Letter not found." }, 404);
  }

  const now = Math.floor(Date.now() / 1000);
  if (row.expires_at < now || row.status === "expired") {
    return c.json({ success: false, code: "EXPIRED", error: "This letter has expired." }, 410);
  }

  if (!row.read_at) {
    await c.env.DB.prepare("UPDATE messages SET read_at = ?, status = 'read' WHERE slug = ?")
      .bind(now, slug)
      .run();
    row.read_at = now;
    row.status = "read";
  }

  const { id: _id, ...publicMessage } = row;
  return c.json({ success: true, data: publicMessage });
});

messages.post("/:slug/report", async (c) => {
  const slug = c.req.param("slug");
  const now = Math.floor(Date.now() / 1000);
  const result = await c.env.DB.prepare(
    "UPDATE messages SET status = 'reported', report_at = ? WHERE slug = ?"
  )
    .bind(now, slug)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ success: false, code: "NOT_FOUND", error: "Letter not found." }, 404);
  }

  return c.json({ success: true });
});
