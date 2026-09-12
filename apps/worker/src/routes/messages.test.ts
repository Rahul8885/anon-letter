import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendLetterEmail } from "../lib/email";
import { messages } from "./messages";

vi.mock("../lib/email", () => ({ sendLetterEmail: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../lib/ratelimit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

const bind = vi.fn();
const run = vi.fn().mockResolvedValue({ success: true });
const prepare = vi.fn(() => ({ bind }));
const env = {
  DB: { prepare },
  RESEND_API_KEY: "test-only",
  PUBLIC_BASE_URL: "https://letters.example",
};
const letter = { template_id: "quiet-garden", message: "Someone noticed your kindness." };

async function create(input: Record<string, unknown>) {
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

beforeEach(() => {
  vi.clearAllMocks();
  bind.mockReturnValue({ run });
});

describe("letter delivery", () => {
  it("creates an accessible share URL without an email address or provider call", async () => {
    const response = await create({ ...letter, delivery_method: "link" });
    expect(response.status).toBe(200);
    const result = (await response.json()) as { slug: string; message_url: string };
    expect(result.message_url).toBe(`https://letters.example/m/${result.slug}`);
    expect(prepare).toHaveBeenCalledOnce();
    expect(sendLetterEmail).not.toHaveBeenCalled();
  });

  it("does not email even if a link request includes an old recipient address", async () => {
    const response = await create({
      ...letter,
      delivery_method: "link",
      recipient_email: "reader@example.com",
    });
    expect(response.status).toBe(200);
    expect(sendLetterEmail).not.toHaveBeenCalled();
    expect(bind.mock.calls.flat()).not.toContain("reader@example.com");
  });

  it("keeps email as the default for existing clients", async () => {
    const response = await create({ ...letter, recipient_email: "reader@example.com" });
    expect(response.status).toBe(200);
    expect(sendLetterEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "reader@example.com" }),
    );
    expect(bind.mock.calls.flat()).not.toContain("reader@example.com");
  });

  it.each([
    {},
    { delivery_method: "email" },
    { delivery_method: "email", recipient_email: "invalid" },
    { delivery_method: "other" },
  ])("rejects invalid email delivery before storing: %j", async (delivery) => {
    expect((await create({ ...letter, ...delivery })).status).toBe(400);
    expect(prepare).not.toHaveBeenCalled();
    expect(sendLetterEmail).not.toHaveBeenCalled();
  });
});
