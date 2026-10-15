import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendLetterEmail } from "../lib/email";
import { checkRateLimit } from "../lib/ratelimit";
import { messages } from "./messages";

vi.mock("../lib/email", () => ({ sendLetterEmail: vi.fn() }));
vi.mock("../lib/ratelimit", () => ({ checkRateLimit: vi.fn() }));

type Call = { sql: string; args: unknown[] };
let calls: Call[];
let firstResult: (sql: string) => unknown;
let runResult: (sql: string) => unknown;

const DB = {
  prepare(sql: string) {
    return {
      bind(...args: unknown[]) {
        calls.push({ sql, args });
        return {
          run: async () => runResult(sql),
          first: async () => firstResult(sql),
        };
      },
    };
  },
};

const env = {
  DB,
  EMAIL_MODE: "resend",
  RESEND_API_KEY: "test-only",
  EMAIL_FROM: "Unsaid <letters@example.com>",
  PUBLIC_BASE_URL: "https://letters.example/",
  ALLOWED_ORIGINS: "https://letters.example",
};
const letter = { template_id: "quiet-garden", message: "Someone noticed your kindness." };
const slug = "abcd1234";

function create(input: unknown) {
  return messages.request(
    "/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    env,
  );
}

const inserts = () => calls.filter((call) => call.sql.includes("INSERT INTO messages"));

beforeEach(() => {
  vi.clearAllMocks();
  calls = [];
  firstResult = () => null;
  runResult = () => ({ success: true, meta: { changes: 1 } });
  vi.mocked(sendLetterEmail).mockResolvedValue({ ok: true });
  vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });
});

describe("POST /messages", () => {
  it("creates a share link without an email address or provider call", async () => {
    const response = await create({ ...letter, delivery_method: "link" });
    expect(response.status).toBe(201);
    const result = (await response.json()) as { slug: string; message_url: string };
    expect(result.slug).toMatch(/^[a-z0-9]{8}$/);
    expect(result.message_url).toBe(`https://letters.example/m/${result.slug}`);
    expect(inserts()).toHaveLength(1);
    expect(sendLetterEmail).not.toHaveBeenCalled();
  });

  it("does not email when a link request still carries an old recipient address", async () => {
    const response = await create({
      ...letter,
      delivery_method: "link",
      recipient_email: "reader@example.com",
    });
    expect(response.status).toBe(201);
    expect(sendLetterEmail).not.toHaveBeenCalled();
    expect(calls.flatMap((call) => call.args)).not.toContain("reader@example.com");
  });

  it("emails by default and never writes the recipient to the database", async () => {
    const response = await create({ ...letter, recipient_email: " reader@example.com " });
    expect(response.status).toBe(201);
    expect(sendLetterEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "reader@example.com", baseUrl: "https://letters.example" }),
    );
    expect(calls.flatMap((call) => call.args)).not.toContain("reader@example.com");
  });

  it("reports a sent email", async () => {
    const response = await create({ ...letter, recipient_email: "reader@example.com" });
    expect(await response.json()).toMatchObject({ email_delivery: "sent" });
  });

  it("keeps the letter and reports failed delivery so the writer can share the link", async () => {
    vi.mocked(sendLetterEmail).mockResolvedValue({ ok: false, reason: "Resend 403: domain" });
    const response = await create({ ...letter, recipient_email: "reader@example.com" });
    expect(response.status).toBe(201);
    const result = (await response.json()) as { slug: string; email_delivery: string };
    expect(result.email_delivery).toBe("failed");
    expect(result.slug).toMatch(/^[a-z0-9]{8}$/);
    expect(calls.some((call) => call.sql.startsWith("DELETE"))).toBe(false);
    expect(calls.flatMap((call) => call.args)).not.toContain("reader@example.com");
  });

  it("omits email_delivery for a share link", async () => {
    const response = await create({ ...letter, delivery_method: "link" });
    expect(await response.json()).not.toHaveProperty("email_delivery");
  });

  it("retries with a new slug when one collides", async () => {
    let attempts = 0;
    runResult = (sql) => {
      if (sql.includes("INSERT") && attempts++ === 0) {
        throw new Error("D1_ERROR: UNIQUE constraint failed: messages.slug");
      }
      return { success: true, meta: { changes: 1 } };
    };
    const response = await create({ ...letter, delivery_method: "link" });
    expect(response.status).toBe(201);
    expect(inserts()).toHaveLength(2);
    expect(inserts()[0].args[1]).not.toBe(inserts()[1].args[1]);
  });

  it("stores trimmed text and lower-cased colours, dropping blank optionals", async () => {
    await create({
      ...letter,
      delivery_method: "link",
      message: "  hello  ",
      from_hint: "   ",
      accent: "#ABCDEF",
    });
    const [, , , message, fromHint, , accent] = inserts()[0].args;
    expect(message).toBe("hello");
    expect(fromHint).toBeNull();
    expect(accent).toBe("#abcdef");
    expect(inserts()[0].args[8]).toBeNull();
  });

  it("stores the writer's heading, trimmed, and rejects one past 80 characters", async () => {
    await create({ ...letter, delivery_method: "link", heading: "  For you, finally.  " });
    expect(inserts()[0].args[8]).toBe("For you, finally.");
    const response = await create({ ...letter, delivery_method: "link", heading: "x".repeat(81) });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "The heading must be 80 characters or fewer",
    });
  });

  it("returns 429 with Retry-After when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: false, retryAfter: 120 });
    const response = await create({ ...letter, delivery_method: "link" });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("120");
    expect(inserts()).toHaveLength(0);
  });

  it.each([
    [{}, "Email is required for email delivery"],
    [{ delivery_method: "email", recipient_email: "invalid" }, "Invalid email address"],
    [{ delivery_method: "other" }, "Unknown delivery method"],
    [{ message: "   " }, "Message cannot be empty"],
    [{ message: "x".repeat(801) }, "Message exceeds 800 characters"],
    [{ template_id: "nope" }, "Unknown template"],
  ])("rejects %j before storing or rate limiting", async (override, error) => {
    const response = await create({ ...letter, ...override });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "VALIDATION_ERROR", error });
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(calls).toHaveLength(0);
    expect(sendLetterEmail).not.toHaveBeenCalled();
  });

  it("rejects a body that isn't JSON", async () => {
    const response = await messages.request("/", { method: "POST", body: "nope" }, env);
    expect(response.status).toBe(400);
  });
});

describe("GET /messages/:slug", () => {
  const now = Math.floor(Date.now() / 1000);
  const row = {
    slug,
    template_id: "night-thought",
    message: "hi",
    heading: null,
    from_hint: null,
    bg_color: null,
    accent: null,
    font_key: null,
    status: "sent",
    read_at: null,
    expires_at: now + 1000,
    created_at: now,
  };

  it("returns the letter without its id and marks the first open as read", async () => {
    firstResult = () => ({ ...row });
    const response = await messages.request(`/${slug}`, {}, env);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { data: Record<string, unknown> };
    expect(body.data).not.toHaveProperty("id");
    expect(body.data.status).toBe("read");
    expect(body.data.read_at).toBeTypeOf("number");
    expect(calls.some((call) => call.sql.includes("UPDATE messages"))).toBe(true);
  });

  it("does not rewrite read_at on later opens", async () => {
    firstResult = () => ({ ...row, status: "read", read_at: now - 10 });
    await messages.request(`/${slug}`, {}, env);
    expect(calls.some((call) => call.sql.includes("UPDATE"))).toBe(false);
  });

  it("returns 410 for an expired letter", async () => {
    firstResult = () => ({ ...row, expires_at: now - 1 });
    expect((await messages.request(`/${slug}`, {}, env)).status).toBe(410);
  });

  it("returns 404 for unknown and malformed slugs", async () => {
    expect((await messages.request(`/${slug}`, {}, env)).status).toBe(404);
    expect((await messages.request("/not-a-slug!", {}, env)).status).toBe(404);
  });
});

describe("POST /messages/:slug/report", () => {
  const report = (target = slug) => messages.request(`/${target}/report`, { method: "POST" }, env);

  it("reports a letter", async () => {
    expect((await report()).status).toBe(200);
  });

  it("is idempotent for an already reported letter", async () => {
    runResult = () => ({ success: true, meta: { changes: 0 } });
    firstResult = () => ({ found: 1 });
    expect((await report()).status).toBe(200);
  });

  it("returns 404 for a letter that doesn't exist", async () => {
    runResult = () => ({ success: true, meta: { changes: 0 } });
    expect((await report()).status).toBe(404);
    expect((await report("BAD")).status).toBe(404);
  });
});
