import { TEMPLATES, type TemplateId } from "@anonletter/shared";
import { Resend } from "resend";

export async function sendLetterEmail(opts: {
  apiKey: string;
  to: string;
  slug: string;
  templateId: TemplateId;
  fromHint?: string;
  baseUrl: string;
}) {
  const resend = new Resend(opts.apiKey);
  const template = TEMPLATES[opts.templateId];

  await resend.emails.send({
    from: "AnonLetter <letters@anonletter.dev>",
    to: opts.to,
    subject: "Someone wrote you a letter",
    html: buildEmailHtml({
      slug: opts.slug,
      accent: template.palette.accent,
      fromHint: opts.fromHint ?? null,
      baseUrl: opts.baseUrl
    })
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildEmailHtml(opts: {
  slug: string;
  accent: string;
  fromHint: string | null;
  baseUrl: string;
}): string {
  const messageUrl = `${opts.baseUrl}/m/${opts.slug}`;
  const hint = opts.fromHint
    ? `from <em>${escapeHtml(opts.fromHint)}</em>`
    : "from someone anonymous";

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#0b0c1a;color:#c8caf0;font-family:Georgia,serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:56px 20px;background:#0b0c1a;">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#131525;border:1px solid rgba(139,144,208,.18);border-radius:6px;">
          <tr><td style="padding:44px 46px 16px;text-align:center;color:${opts.accent};font-size:11px;letter-spacing:.3em;text-transform:uppercase;">AnonLetter</td></tr>
          <tr><td style="padding:22px 46px 46px;">
            <h1 style="margin:0 0 16px;font-size:30px;line-height:1.25;font-weight:300;font-style:italic;color:#c8caf0;">Someone wrote you a letter.</h1>
            <p style="margin:0 0 30px;font:14px/1.8 Arial,sans-serif;color:rgba(200,202,240,.62);">It arrived ${hint}. Open it when you are ready.</p>
            <a href="${messageUrl}" style="display:inline-block;padding:14px 26px;background:${opts.accent};color:#0b0c1a;text-decoration:none;border-radius:3px;font:700 11px Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;">Open your letter</a>
            <p style="margin:26px 0 0;font:11px/1.6 Arial,sans-serif;color:rgba(139,144,208,.35);word-break:break-all;">${messageUrl}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
