import { TEMPLATES, type TemplateId } from "@anonletter/shared";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type SendResult = { ok: true } | { ok: false; reason: string };

/**
 * Delivers the "you have a letter" email. `to` is used for this one request and is never
 * stored or logged — the reason string on failure must not include it either.
 */
export async function sendLetterEmail(opts: {
  mode: "resend" | "log";
  apiKey?: string;
  from: string;
  to: string;
  slug: string;
  templateId: TemplateId;
  fromHint?: string;
  baseUrl: string;
}): Promise<SendResult> {
  const content = buildEmail({
    slug: opts.slug,
    accent: TEMPLATES[opts.templateId].palette.accent,
    fromHint: opts.fromHint ?? null,
    baseUrl: opts.baseUrl,
  });

  if (opts.mode === "log") {
    console.log(`[email:log] letter ready at ${content.url} (not sent; EMAIL_MODE=log)`);
    return { ok: true };
  }

  if (!opts.apiKey) return { ok: false, reason: "RESEND_API_KEY is not set" };

  let response: Response;
  try {
    response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: opts.from,
        to: [opts.to],
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
    });
  } catch (error) {
    return { ok: false, reason: `Resend unreachable: ${(error as Error).message}` };
  }

  if (!response.ok) {
    // Resend error bodies are { name, message, statusCode }; none of them echo the recipient
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    return { ok: false, reason: `Resend ${response.status}: ${body?.message ?? "unknown error"}` };
  }

  return { ok: true };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildEmail(opts: {
  slug: string;
  accent: string;
  fromHint: string | null;
  baseUrl: string;
}): { subject: string; html: string; text: string; url: string } {
  const url = `${opts.baseUrl.replace(/\/+$/, "")}/m/${opts.slug}`;
  const safeUrl = escapeHtml(url);
  const hintHtml = opts.fromHint
    ? `from <em>${escapeHtml(opts.fromHint)}</em>`
    : "from someone who chose not to sign";
  const hintText = opts.fromHint ? `from "${opts.fromHint}"` : "from someone who chose not to sign";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Someone wrote you a letter</title>
  </head>
  <body style="margin:0;background:#0b0c1a;color:#c8caf0;font-family:Georgia,serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:56px 20px;background:#0b0c1a;">
      <tr><td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#131525;border:1px solid rgba(139,144,208,.18);border-radius:6px;">
          <tr><td style="padding:44px 46px 16px;text-align:center;color:${opts.accent};font:11px Arial,sans-serif;letter-spacing:.3em;text-transform:uppercase;">Unsaid</td></tr>
          <tr><td style="padding:22px 46px 40px;">
            <h1 style="margin:0 0 16px;font-size:30px;line-height:1.25;font-weight:300;font-style:italic;color:#c8caf0;">Someone wrote you a letter.</h1>
            <p style="margin:0 0 30px;font:14px/1.8 Arial,sans-serif;color:rgba(200,202,240,.62);">It arrived ${hintHtml}. Open it when you are ready. No one will know you've read it.</p>
            <a href="${safeUrl}" style="display:inline-block;padding:14px 26px;background:${opts.accent};color:#0b0c1a;text-decoration:none;border-radius:3px;font:700 11px Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;">Open your letter</a>
            <p style="margin:26px 0 0;font:11px/1.6 Arial,sans-serif;color:rgba(139,144,208,.45);word-break:break-all;">Or copy this link: ${safeUrl}</p>
          </td></tr>
          <tr><td style="padding:22px 46px 32px;border-top:1px solid rgba(139,144,208,.08);font:10px/1.8 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:rgba(139,144,208,.35);">
            This letter disappears in 30 days. The sender stays anonymous.<br>
            If it was unwanted, open it and use Report.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [
    "Someone wrote you a letter.",
    "",
    `It arrived ${hintText}. Open it when you are ready:`,
    url,
    "",
    "This letter disappears in 30 days. The sender stays anonymous.",
    "If it was unwanted, open it and use Report.",
  ].join("\n");

  return { subject: "Someone wrote you a letter", html, text, url };
}
