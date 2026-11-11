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
 * The email is the envelope on the doormat: the reader learns a letter is waiting and which
 * room it was written in, and nothing of the letter itself. Pure HTML, no images, so it
 * renders the same with images blocked. Mail clients mostly ignore web fonts; the stacks fall
 * back to slab and system faces that keep the shape of Chubbo and Supreme.
 * Accents carry the band and button only; text sits on `ink` and `soft` for contrast.
 */
interface EmailRoom {
  name: string;
  /** How this envelope is fastened; the one line that tells the reader which room awaits. */
  fastening: string;
  scheme: "light" | "dark";
  /** Page behind the sheet. */
  desk: string;
  /** The sheet itself. */
  paper: string;
  edge: string;
  accent: string;
  ink: string;
  soft: string;
  buttonInk: string;
  link: string;
}

const SANS = "Supreme,'Helvetica Neue',Helvetica,Arial,sans-serif";
const DISPLAY = "Chubbo,'Roboto Slab',Rockwell,'Rockwell Nova','Courier New',Georgia,serif";

const ROOMS: Record<TemplateId, EmailRoom> = {
  "soft-bloom": {
    name: "Soft Bloom",
    fastening: "Tied with a ribbon.",
    scheme: "light",
    desk: "#f3e3e6",
    paper: "#fffafa",
    edge: "#ecd3d9",
    accent: "#b94a5d",
    ink: "#3f1b28",
    soft: "#6f4656",
    buttonInk: "#fffdfc",
    link: "#963746",
  },
  "old-letter": {
    name: "Old Letter",
    fastening: "Closed with wax.",
    scheme: "light",
    desk: "#efe4d2",
    paper: "#fbf6ec",
    edge: "#e2d2b8",
    accent: "#6e4423",
    ink: "#33200e",
    soft: "#634b31",
    buttonInk: "#fffaf2",
    link: "#6e4423",
  },
  "night-thought": {
    name: "Night Thought",
    fastening: "Wound shut with thread.",
    scheme: "dark",
    desk: "#101122",
    paper: "#1a1c34",
    edge: "#2c2f52",
    accent: "#a9adec",
    ink: "#eceefb",
    soft: "#b0b4de",
    buttonInk: "#14152a",
    link: "#c9ccf5",
  },
  "quiet-garden": {
    name: "Quiet Garden",
    fastening: "Held by a paper band.",
    scheme: "light",
    desk: "#e3ede5",
    paper: "#f8fbf7",
    edge: "#cadfcf",
    accent: "#3b6d11",
    ink: "#18300a",
    soft: "#46603b",
    buttonInk: "#f7fbf4",
    link: "#2f5a0c",
  },
  "confetti-love": {
    name: "Confetti Love",
    fastening: "Taped shut in a hurry.",
    scheme: "light",
    desk: "#f5ebd2",
    paper: "#fffcf3",
    edge: "#eadab3",
    accent: "#8a531c",
    ink: "#3e280c",
    soft: "#6f532d",
    buttonInk: "#fffdf6",
    link: "#7a4815",
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
  const fonts = escapeHtml(`${base}/fonts`);
  const sans = `font-family:${SANS};color:${room.soft};`;

  const arrivalHtml = opts.fromHint
    ? `It arrived signed only <span style="color:${room.ink};">“${escapeHtml(opts.fromHint)}”</span>.`
    : "It arrived from someone who chose not to sign.";
  const arrivalText = opts.fromHint
    ? `It arrived signed only "${opts.fromHint}".`
    : "It arrived from someone who chose not to sign.";
  const preheader = `A ${room.name} letter, ${room.fastening.charAt(0).toLowerCase()}${room.fastening.slice(1, -1)}. Open it when you’re ready.`;

  // Fluid 560px column: a max-width div for every client, a fixed table only for Outlook.
  // The desk colour also sits on a full-width wrapper because Gmail and Yahoo strip <body> styles.
  const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
    <meta name="color-scheme" content="${room.scheme} only">
    <meta name="supported-color-schemes" content="${room.scheme} only">
    <title>Someone wrote you a letter</title>
    <style>
      @font-face { font-family: Chubbo; font-weight: 700; font-display: swap; src: url("${fonts}/chubbo-700.woff2") format("woff2"); }
      @font-face { font-family: Supreme; font-weight: 400; font-display: swap; src: url("${fonts}/supreme-400.woff2") format("woff2"); }
      @font-face { font-family: Supreme; font-weight: 500; font-display: swap; src: url("${fonts}/supreme-500.woff2") format("woff2"); }
      :root { color-scheme: ${room.scheme} only; }
      html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; background: ${room.desk}; }
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table { border-collapse: collapse; }
      a.open:hover { opacity: .9; }
      @media (max-width: 600px) {
        .column { padding: 24px 14px 36px !important; }
        .sheet { padding: 32px 24px 34px !important; }
        .headline { font-size: 30px !important; }
      }
    </style>
    <!--[if mso]><style>td, p, a, span, div, h1 { font-family: Arial, sans-serif !important; }</style><![endif]-->
  </head>
  <body bgcolor="${room.desk}" style="margin:0;padding:0;width:100%;background:${room.desk};">
    <div role="article" aria-roledescription="email" aria-label="Someone wrote you a letter" lang="en" style="margin:0;padding:0;width:100%;background:${room.desk};">
      <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${room.desk};">${escapeHtml(preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${room.desk}" style="width:100%;background:${room.desk};">
        <tr><td align="center" style="padding:0;">
          <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
          <div class="column" style="max-width:560px;margin:0 auto;padding:44px 20px 52px;text-align:left;">
            <p style="margin:0 0 22px;font-family:${DISPLAY};font-weight:700;font-size:20px;line-height:1;letter-spacing:-.02em;color:${room.ink};">Unsaid</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${room.paper}" style="width:100%;background:${room.paper};border:1px solid ${room.edge};border-top:4px solid ${room.accent};border-radius:6px;border-collapse:separate;">
              <tr><td class="sheet" style="padding:40px 40px 42px;">
                <p style="margin:0;${sans}font-size:14px;line-height:1.5;">${room.name} <span style="color:${room.accent};">&nbsp;·&nbsp;</span> ${room.fastening}</p>
                <h1 class="headline" style="margin:22px 0 0;font-family:${DISPLAY};font-weight:700;font-size:36px;line-height:1.1;letter-spacing:-.025em;color:${room.ink};">Someone wrote this for&nbsp;you.</h1>
                <p style="margin:16px 0 0;${sans}font-size:16px;line-height:1.65;">${arrivalHtml} Open it when you’re ready. No one will know you’ve read it.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 0;"><tr>
                  <td bgcolor="${room.accent}" style="border-radius:5px;background:${room.accent};">
                    <a class="open" href="${safeUrl}" style="display:inline-block;padding:15px 26px;font-family:${SANS};font-weight:500;font-size:16px;line-height:1;color:${room.buttonInk};text-decoration:none;border-radius:5px;">Open your letter</a>
                  </td>
                </tr></table>
                <p style="margin:24px 0 0;${sans}font-size:13px;line-height:1.6;">Or paste this into your browser:<br><a href="${safeUrl}" style="color:${room.link};text-decoration:underline;word-break:break-all;">${safeUrl}</a></p>
              </td></tr>
            </table>
            <p style="margin:22px 4px 0;${sans}font-size:13px;line-height:1.7;">The letter disappears in six months. The sender stays anonymous. Your address was used to deliver this and was not saved.<br>If it was unwanted, open it and use Report.</p>
          </div>
          <!--[if mso]></td></tr></table><![endif]-->
        </td></tr>
      </table>
    </div>
  </body>
</html>`;

  const text = [
    "Someone wrote this for you.",
    "",
    `A ${room.name} letter. ${room.fastening}`,
    `${arrivalText} Open it when you're ready:`,
    url,
    "",
    "The letter disappears in six months. The sender stays anonymous.",
    "If it was unwanted, open it and use Report.",
  ].join("\n");

  return { subject: "Someone wrote you a letter", html, text, url };
}
