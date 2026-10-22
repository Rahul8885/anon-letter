import type { TemplateId } from "@anonletter/shared";

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
    templateId: opts.templateId,
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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * The email is the envelope on the doormat: the same photographed stationery the reader is
 * about to open, on that mood's desk colour, and nothing of the letter itself. Colours are
 * picked for contrast on their own desk (accents never carry text on their own background).
 * `/email/<mood>.jpg` is a flattened copy of the sealed envelope layers, served by the web app.
 */
interface EmailRoom {
  name: string;
  /** How this envelope is fastened; the one line that tells the reader which room awaits. */
  fastening: string;
  /** Alt text for the envelope photograph. */
  alt: string;
  scheme: "light" | "dark";
  desk: string;
  ink: string;
  soft: string;
  rule: string;
  button: string;
  buttonInk: string;
  link: string;
  /** The room's own voice for the fastening line; email-safe stacks only. */
  moodFont: string;
  moodStyle: string;
}

const SANS = "Supreme,'Helvetica Neue',Helvetica,Arial,sans-serif";
const DISPLAY = "Chubbo,Georgia,'Times New Roman',serif";

const ROOMS: Record<TemplateId, EmailRoom> = {
  "soft-bloom": {
    name: "Soft Bloom",
    fastening: "Tied with a ribbon.",
    alt: "A blush envelope tied with a satin ribbon",
    scheme: "light",
    desk: "#f6e8ea",
    ink: "#3f1b28",
    soft: "#6f4656",
    rule: "#e8cdd4",
    button: "#b94a5d",
    buttonInk: "#fffdfc",
    link: "#963746",
    moodFont: "Georgia,'Times New Roman',serif",
    moodStyle: "font-style:italic;",
  },
  "old-letter": {
    name: "Old Letter",
    fastening: "Closed with wax.",
    alt: "An aged ivory envelope closed with a red wax seal",
    scheme: "light",
    desk: "#f4ebdc",
    ink: "#33200e",
    soft: "#634b31",
    rule: "#e0cdb0",
    button: "#6e4423",
    buttonInk: "#fffaf2",
    link: "#6e4423",
    moodFont: "'Courier New',Courier,monospace",
    moodStyle: "letter-spacing:.01em;",
  },
  "night-thought": {
    name: "Night Thought",
    fastening: "Wound shut with thread.",
    alt: "A navy envelope wound shut with cotton thread",
    scheme: "dark",
    desk: "#15162a",
    ink: "#e6e7f8",
    soft: "#a9adda",
    rule: "#2c2f52",
    button: "#a9adec",
    buttonInk: "#14152a",
    link: "#c3c6f2",
    moodFont: "Georgia,'Times New Roman',serif",
    moodStyle: "font-style:italic;",
  },
  "quiet-garden": {
    name: "Quiet Garden",
    fastening: "Held by a paper band.",
    alt: "A sage envelope held by a vellum band with a pressed fern",
    scheme: "light",
    desk: "#e8f1ea",
    ink: "#18300a",
    soft: "#46603b",
    rule: "#c6dccd",
    button: "#3b6d11",
    buttonInk: "#f7fbf4",
    link: "#2f5a0c",
    moodFont: "Georgia,'Times New Roman',serif",
    moodStyle: "",
  },
  "confetti-love": {
    name: "Confetti Love",
    fastening: "Taped shut in a hurry.",
    alt: "A butter-yellow envelope taped shut with coral tape",
    scheme: "light",
    desk: "#f8f0dc",
    ink: "#3e280c",
    soft: "#6f532d",
    rule: "#e7d6b0",
    button: "#8a531c",
    buttonInk: "#fffdf6",
    link: "#7a4815",
    moodFont: "'Trebuchet MS','Helvetica Neue',Arial,sans-serif",
    moodStyle: "font-weight:700;",
  },
};

export function buildEmail(opts: {
  slug: string;
  templateId: TemplateId;
  fromHint: string | null;
  baseUrl: string;
}): { subject: string; html: string; text: string; url: string } {
  const base = opts.baseUrl.replace(/\/+$/, "");
  const room = ROOMS[opts.templateId] ?? ROOMS["night-thought"];
  const url = `${base}/m/${opts.slug}`;
  const safeUrl = escapeHtml(url);
  const image = escapeHtml(
    `${base}/email/${opts.templateId in ROOMS ? opts.templateId : "night-thought"}.jpg`,
  );
  const fonts = escapeHtml(`${base}/fonts`);

  const arrivalHtml = opts.fromHint
    ? `It arrived signed only <em style="font-style:italic;color:${room.ink};">“${escapeHtml(opts.fromHint)}”</em>.`
    : "It arrived from someone who chose not to sign.";
  const arrivalText = opts.fromHint
    ? `It arrived signed only "${opts.fromHint}".`
    : "It arrived from someone who chose not to sign.";
  const preheader = `A letter, ${room.fastening.charAt(0).toLowerCase()}${room.fastening.slice(1, -1)}. Open it when you’re ready.`;

  const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="color-scheme" content="${room.scheme} only">
    <meta name="supported-color-schemes" content="${room.scheme} only">
    <title>Someone wrote you a letter</title>
    <style>
      @font-face { font-family: Chubbo; font-weight: 700; font-display: swap; src: url("${fonts}/chubbo-700.woff2") format("woff2"); }
      @font-face { font-family: Supreme; font-weight: 400; font-display: swap; src: url("${fonts}/supreme-400.woff2") format("woff2"); }
      @font-face { font-family: Supreme; font-weight: 500; font-display: swap; src: url("${fonts}/supreme-500.woff2") format("woff2"); }
      :root { color-scheme: ${room.scheme} only; }
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      a.open:hover { opacity: .9; }
      @media (max-width: 600px) {
        .outer { padding: 28px 18px 36px !important; }
        .headline { font-size: 30px !important; }
      }
    </style>
    <!--[if mso]><style>td, p, a, h1, span { font-family: Georgia, serif !important; }</style><![endif]-->
  </head>
  <body style="margin:0;padding:0;background:${room.desk};" bgcolor="${room.desk}">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${room.desk};">${escapeHtml(preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${room.desk}" style="background:${room.desk};">
      <tr><td align="center" class="outer" style="padding:44px 24px 52px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;">
          <tr><td style="padding:0 0 26px;font-family:${DISPLAY};font-weight:700;font-size:21px;line-height:1;letter-spacing:-.02em;color:${room.ink};">Unsaid</td></tr>
          <tr><td style="padding:0;">
            <a href="${safeUrl}" style="display:block;text-decoration:none;"><img src="${image}" width="560" height="320" alt="${escapeHtml(room.alt)}" style="display:block;width:100%;max-width:560px;height:auto;border:0;outline:none;color:${room.soft};font-family:${SANS};font-size:14px;"></a>
          </td></tr>
          <tr><td style="padding:18px 0 0;font-family:${room.moodFont};${room.moodStyle}font-size:15px;line-height:1.5;color:${room.soft};">${room.fastening}</td></tr>
          <tr><td class="headline" style="padding:30px 0 14px;font-family:${DISPLAY};font-weight:700;font-size:36px;line-height:1.08;letter-spacing:-.025em;color:${room.ink};">Someone wrote this for&nbsp;you.</td></tr>
          <tr><td style="padding:0 0 30px;font-family:${SANS};font-size:16px;line-height:1.65;color:${room.soft};">${arrivalHtml} Open it when you’re ready. No one will know you’ve read it.</td></tr>
          <tr><td style="padding:0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td bgcolor="${room.button}" style="border-radius:5px;background:${room.button};">
                <a class="open" href="${safeUrl}" style="display:inline-block;padding:15px 26px;font-family:${SANS};font-weight:500;font-size:16px;line-height:1;color:${room.buttonInk};text-decoration:none;border-radius:5px;">Open your letter</a>
              </td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:22px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${room.soft};">Or paste this into your browser:<br><a href="${safeUrl}" style="color:${room.link};text-decoration:underline;word-break:break-all;">${safeUrl}</a></td></tr>
          <tr><td style="padding:40px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid ${room.rule};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr></table></td></tr>
          <tr><td style="padding:18px 0 0;font-family:${SANS};font-size:13px;line-height:1.7;color:${room.soft};">
            The letter disappears in 30 days. The sender stays anonymous. Your address was used to deliver this and was not saved.<br>
            If it was unwanted, open it and use Report.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [
    "Someone wrote this for you.",
    "",
    `A ${room.name} letter. ${room.fastening}`,
    `${arrivalText} Open it when you're ready:`,
    url,
    "",
    "The letter disappears in 30 days. The sender stays anonymous.",
    "If it was unwanted, open it and use Report.",
  ].join("\n");

  return { subject: "Someone wrote you a letter", html, text, url };
}
