# AnonLetter — Claude Code Kickstart Spec
> Anonymous Templated Message Platform · v1.0 · June 2025  
> Feed this entire file to Claude Code at project start. It contains everything needed to scaffold, implement, and deploy the full stack.

---

## 0. What You're Building

AnonLetter lets anyone compose a beautifully designed, template-based message and deliver it directly to a recipient's email inbox — without ever revealing who sent it.

**One-line pitch:** "Send someone a beautiful, anonymous letter in under 2 minutes — no account needed."

**What makes it different from every competitor:**
- True sender anonymity (recipient email never stored — passed directly to Resend API and discarded)
- Email delivery to inbox (not just a link to copy-paste — it *finds* them)
- Template-first UX (5 opinionated moods, not a drag-and-drop builder)
- Open source, self-hostable, $0/month to run at Phase 0 scale
- Cinematic, award-level UI — the feeling is the feature

---

## 1. Tech Stack — Non-Negotiable

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| React 18 | latest | SPA framework |
| TypeScript | strict mode | Full type safety |
| Vite | latest | Build tool, HMR |
| Tailwind CSS | v3 | Utility styling |
| React Router v6 | latest | Client-side routing |
| Zustand | latest | Composer state |
| GSAP + ScrollTrigger | 3.12.x | All scroll/entrance animations |
| Lenis | latest | Smooth scroll momentum |
| Framer Motion | latest | Route transitions, spring animations |

### Backend (Cloudflare Workers)
| Tool | Version | Purpose |
|---|---|---|
| Hono.js | latest | Edge web framework |
| Drizzle ORM | latest | Type-safe D1 queries |
| Cloudflare D1 | — | Serverless SQLite at edge |
| Resend SDK | latest | Email delivery |
| Zod | latest | Runtime validation |

### Infrastructure
| Service | Free Tier | Purpose |
|---|---|---|
| Cloudflare Pages | Unlimited bandwidth | Frontend hosting |
| Cloudflare Workers | 100K req/day | Backend API |
| Cloudflare D1 | 5M reads/day, 5GB | Database |
| Resend | 3K emails/month | Email delivery |
| GitHub Actions | Free for public OSS | CI/CD |

### Developer Experience
- pnpm workspaces (monorepo)
- Wrangler CLI (Cloudflare local dev)
- Biome (lint + format, replaces ESLint + Prettier)
- Vitest (unit testing)

---

## 2. Monorepo Structure

```
anonletter/
├── apps/
│   ├── web/                          # React SPA → Cloudflare Pages
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── composer/
│   │   │   │   │   ├── TemplatePicker.tsx
│   │   │   │   │   ├── MessageInput.tsx
│   │   │   │   │   ├── CustomisePanel.tsx
│   │   │   │   │   ├── RecipientEmail.tsx
│   │   │   │   │   └── LivePreview.tsx
│   │   │   │   ├── templates/
│   │   │   │   │   ├── SoftBloom.tsx
│   │   │   │   │   ├── OldLetter.tsx
│   │   │   │   │   ├── NightThought.tsx
│   │   │   │   │   ├── QuietGarden.tsx
│   │   │   │   │   └── ConfettiLove.tsx
│   │   │   │   └── ui/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Input.tsx
│   │   │   │       ├── ColorPicker.tsx
│   │   │   │       └── Cursor.tsx
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx          # Landing page
│   │   │   │   ├── Compose.tsx       # Multi-step composer
│   │   │   │   ├── Success.tsx       # Post-send
│   │   │   │   └── Message.tsx       # /m/[slug] recipient page
│   │   │   ├── store/
│   │   │   │   └── composerStore.ts  # Zustand
│   │   │   ├── lib/
│   │   │   │   ├── api.ts            # API client (typed fetch)
│   │   │   │   └── animations.ts     # Shared GSAP helpers
│   │   │   ├── hooks/
│   │   │   │   ├── useLenis.ts
│   │   │   │   └── useParticles.ts
│   │   │   └── main.tsx
│   │   ├── public/
│   │   │   └── fonts/                # Self-hosted web fonts
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── worker/                       # Cloudflare Worker → Hono API
│       ├── src/
│       │   ├── routes/
│       │   │   ├── messages.ts       # POST /messages, GET /messages/:slug
│       │   │   └── health.ts         # GET /health
│       │   ├── db/
│       │   │   ├── schema.ts         # Drizzle schema
│       │   │   └── index.ts          # D1 client setup
│       │   ├── lib/
│       │   │   ├── slug.ts           # Crypto slug generation
│       │   │   ├── email.ts          # Resend HTML builder
│       │   │   ├── ratelimit.ts      # IP-based rate limiting
│       │   │   └── validate.ts       # Zod schemas
│       │   └── index.ts              # Hono app entry
│       ├── wrangler.toml
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared TS types
│       ├── src/
│       │   ├── types.ts              # Message, Template, ApiResponse
│       │   └── templates.ts          # Template registry
│       └── package.json
│
├── templates/                        # Template definitions
│   ├── soft-bloom/
│   │   ├── meta.json
│   │   └── preview.svg
│   ├── old-letter/
│   ├── night-thought/
│   ├── quiet-garden/
│   └── confetti-love/
│
├── migrations/
│   └── 0001_init.sql
│
├── .github/
│   └── workflows/
│       ├── deploy-web.yml
│       └── deploy-worker.yml
│
├── package.json                      # pnpm workspace root
├── pnpm-workspace.yaml
├── biome.json
└── README.md
```

---

## 3. Database Schema (Cloudflare D1 / SQLite)

```sql
-- migrations/0001_init.sql

CREATE TABLE messages (
  id          TEXT     PRIMARY KEY,                    -- UUID v4
  slug        TEXT     UNIQUE NOT NULL,                -- 8-char random, used in URL
  template_id TEXT     NOT NULL,                       -- 'soft-bloom' | 'old-letter' | 'night-thought' | 'quiet-garden' | 'confetti-love'
  message     TEXT     NOT NULL CHECK(length(message) <= 800),
  from_hint   TEXT,                                    -- optional "from a friend" hint
  bg_color    TEXT,                                    -- hex e.g. #fdf0f5 (null = template default)
  accent      TEXT,                                    -- hex accent override
  font_key    TEXT,                                    -- font identifier override
  status      TEXT     DEFAULT 'sent'                  -- 'sent' | 'read' | 'reported' | 'expired'
               CHECK(status IN ('sent','read','reported','expired')),
  read_at     INTEGER,                                 -- unix timestamp, null until opened
  report_at   INTEGER,                                 -- unix timestamp if reported
  expires_at  INTEGER  NOT NULL,                       -- created_at + 30 days (unix)
  created_at  INTEGER  NOT NULL                        -- unix timestamp
);

CREATE INDEX idx_slug     ON messages(slug);
CREATE INDEX idx_expires  ON messages(expires_at);
CREATE INDEX idx_status   ON messages(status);

-- Rate limiting (abuse prevention)
CREATE TABLE rate_limits (
  ip_hash      TEXT     NOT NULL,   -- SHA-256 of sender IP
  window_start INTEGER  NOT NULL,   -- start of 1-hour window (unix)
  count        INTEGER  DEFAULT 0,  -- requests in this window
  PRIMARY KEY (ip_hash, window_start)
);

-- IMPORTANT: recipient_email is NEVER stored. It is passed directly
-- to Resend's API and immediately discarded. This is a deliberate
-- privacy design decision that must never be changed.
```

---

## 4. Shared Types (`packages/shared/src/types.ts`)

```typescript
export type TemplateId =
  | 'soft-bloom'
  | 'old-letter'
  | 'night-thought'
  | 'quiet-garden'
  | 'confetti-love';

export type MessageStatus = 'sent' | 'read' | 'reported' | 'expired';

export interface Template {
  id: TemplateId;
  name: string;
  tags: string[];
  palette: {
    bg: string;
    accent: string;
    text: string;
  };
  fonts: {
    display: string;
    body: string;
  };
  motif: string; // emoji or SVG key
}

export interface Message {
  id: string;
  slug: string;
  template_id: TemplateId;
  message: string;
  from_hint: string | null;
  bg_color: string | null;
  accent: string | null;
  font_key: string | null;
  status: MessageStatus;
  read_at: number | null;
  expires_at: number;
  created_at: number;
}

// API request/response contracts
export interface CreateMessageRequest {
  template_id: TemplateId;
  message: string;
  recipient_email: string;         // validated, never stored
  from_hint?: string;
  bg_color?: string;
  accent?: string;
  font_key?: string;
}

export interface CreateMessageResponse {
  success: true;
  slug: string;
  message_url: string;
}

export interface GetMessageResponse {
  success: true;
  data: Omit<Message, 'id'>;       // slug is the public identifier
}

export interface ApiError {
  success: false;
  error: string;
  code: 'RATE_LIMITED' | 'NOT_FOUND' | 'EXPIRED' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
}
```

---

## 5. Template Registry (`packages/shared/src/templates.ts`)

```typescript
import type { Template } from './types';

export const TEMPLATES: Record<string, Template> = {
  'soft-bloom': {
    id: 'soft-bloom',
    name: 'Soft Bloom',
    tags: ['confession', 'admiration', 'secret admirer', 'appreciation'],
    palette: { bg: '#fdf0f5', accent: '#f0a0ba', text: '#4a2030' },
    fonts: { display: 'Playfair Display', body: 'Lato' },
    motif: '🌸',
  },
  'old-letter': {
    id: 'old-letter',
    name: 'Old Letter',
    tags: ['apology', 'gratitude', 'heartfelt', 'honesty'],
    palette: { bg: '#fdf6ec', accent: '#c4976a', text: '#3a2410' },
    fonts: { display: 'Courier New', body: 'Georgia' },
    motif: '📜',
  },
  'night-thought': {
    id: 'night-thought',
    name: 'Night Thought',
    tags: ['honest truth', 'late-night', 'confession', 'feelings'],
    palette: { bg: '#1a1b2e', accent: '#8b90d0', text: '#c8caf0' },
    fonts: { display: 'Cormorant Garamond', body: 'DM Sans' },
    motif: '✦',
  },
  'quiet-garden': {
    id: 'quiet-garden',
    name: 'Quiet Garden',
    tags: ['gratitude', 'birthday', 'congratulations', 'pride'],
    palette: { bg: '#eaf7f0', accent: '#3B6D11', text: '#1a3208' },
    fonts: { display: 'Playfair Display', body: 'Inter' },
    motif: '🌿',
  },
  'confetti-love': {
    id: 'confetti-love',
    name: 'Confetti Love',
    tags: ['celebration', 'birthday', 'hype', 'excitement'],
    palette: { bg: '#fff8e7', accent: '#e8c99a', text: '#4a3010' },
    fonts: { display: 'Teko', body: 'Rajdhani' },
    motif: '🎊',
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);
```

---

## 6. Backend Implementation

### `apps/worker/src/lib/slug.ts`

```typescript
// Cryptographically random 8-character slug
// Uses Web Crypto API (available in Cloudflare Workers natively)
export function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes)
    .map(b => chars[b % chars.length])
    .join('');
}
```

### `apps/worker/src/lib/validate.ts`

```typescript
import { z } from 'zod';
import type { TemplateId } from '@anonletter/shared';

export const TEMPLATE_IDS: TemplateId[] = [
  'soft-bloom', 'old-letter', 'night-thought', 'quiet-garden', 'confetti-love'
];

export const CreateMessageSchema = z.object({
  template_id:     z.enum(['soft-bloom', 'old-letter', 'night-thought', 'quiet-garden', 'confetti-love']),
  message:         z.string().min(1, 'Message cannot be empty').max(800, 'Message exceeds 800 characters'),
  recipient_email: z.string().email('Invalid email address'),
  from_hint:       z.string().max(60).optional(),
  bg_color:        z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  accent:          z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  font_key:        z.string().max(40).optional(),
});

export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;
```

### `apps/worker/src/lib/ratelimit.ts`

```typescript
import type { D1Database } from '@cloudflare/workers-types';

const MAX_PER_HOUR = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function checkRateLimit(
  db: D1Database,
  ip: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  // Hash the IP — never store raw IPs
  const ipHash = await hashIp(ip);
  const windowStart = Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS;

  const row = await db
    .prepare('SELECT count FROM rate_limits WHERE ip_hash = ? AND window_start = ?')
    .bind(ipHash, windowStart)
    .first<{ count: number }>();

  if (row && row.count >= MAX_PER_HOUR) {
    const retryAfter = Math.ceil((windowStart + WINDOW_MS - Date.now()) / 1000);
    return { allowed: false, retryAfter };
  }

  // Upsert the counter
  await db
    .prepare(`
      INSERT INTO rate_limits (ip_hash, window_start, count)
      VALUES (?, ?, 1)
      ON CONFLICT(ip_hash, window_start)
      DO UPDATE SET count = count + 1
    `)
    .bind(ipHash, windowStart)
    .run();

  return { allowed: true };
}

async function hashIp(ip: string): Promise<string> {
  const encoded = new TextEncoder().encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

### `apps/worker/src/lib/email.ts`

```typescript
import { Resend } from 'resend';
import type { Template } from '@anonletter/shared';

// Build the HTML email that the recipient receives in their inbox
export function buildEmailHtml(opts: {
  slug: string;
  template: Template;
  fromHint: string | null;
  baseUrl: string;
}): string {
  const { slug, template, fromHint, baseUrl } = opts;
  const messageUrl = `${baseUrl}/m/${slug}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You have a letter</title>
</head>
<body style="margin:0;padding:0;background:#0d0e1a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0e1a;padding:60px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#131525;border:1px solid rgba(139,144,208,0.15);border-radius:6px;overflow:hidden;max-width:520px;">

          <!-- Header bar -->
          <tr>
            <td style="padding:32px 48px 0;text-align:center;">
              <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(139,144,208,0.4);">
                AnonLetter
              </p>
            </td>
          </tr>

          <!-- Main copy -->
          <tr>
            <td style="padding:40px 48px 32px;">
              <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:28px;font-style:italic;font-weight:300;color:#c8caf0;line-height:1.3;">
                Someone wrote you a letter.
              </p>
              <p style="margin:0 0 32px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:300;color:rgba(200,202,240,0.45);line-height:1.7;">
                ${fromHint
                  ? `It was sent anonymously — from <em>${fromHint}</em> — and it's waiting for you.`
                  : `It was sent anonymously, and it's waiting for you.`
                }
                No one will know you've read it.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${template.palette.accent};border-radius:3px;">
                    <a href="${messageUrl}"
                       style="display:inline-block;padding:14px 36px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:#0d0e1a;text-decoration:none;">
                      Open your letter
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:24px 0 0;font-size:11px;color:rgba(139,144,208,0.25);font-family:'DM Sans',sans-serif;word-break:break-all;">
                Or copy: ${messageUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px 32px;border-top:1px solid rgba(139,144,208,0.07);">
              <p style="margin:0;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(139,144,208,0.18);font-family:'DM Sans',sans-serif;line-height:1.8;">
                This letter expires in 30 days · The sender remains anonymous forever<br>
                If this was unwanted, <a href="${baseUrl}/report/${slug}" style="color:rgba(139,144,208,0.25);">report it here</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendDeliveryEmail(opts: {
  resend: Resend;
  recipientEmail: string;    // used here only, never persisted
  slug: string;
  template: Template;
  fromHint: string | null;
  baseUrl: string;
}): Promise<void> {
  const html = buildEmailHtml({
    slug: opts.slug,
    template: opts.template,
    fromHint: opts.fromHint,
    baseUrl: opts.baseUrl,
  });

  await opts.resend.emails.send({
    from:    'AnonLetter <letters@anonletter.app>',
    to:      opts.recipientEmail,  // <-- only usage; not stored anywhere
    subject: 'You have a letter waiting for you',
    html,
  });
}
```

### `apps/worker/src/routes/messages.ts`

```typescript
import { Hono }              from 'hono';
import { Resend }            from 'resend';
import { v4 as uuidv4 }     from 'uuid';
import { CreateMessageSchema } from '../lib/validate';
import { generateSlug }      from '../lib/slug';
import { checkRateLimit }    from '../lib/ratelimit';
import { sendDeliveryEmail } from '../lib/email';
import { TEMPLATES }         from '@anonletter/shared';
import type { Env }          from '../index';

const messages = new Hono<{ Bindings: Env }>();

// POST /api/messages — create and send a message
messages.post('/', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';

  // Rate limiting
  const { allowed, retryAfter } = await checkRateLimit(c.env.DB, ip);
  if (!allowed) {
    return c.json({
      success: false,
      error: 'Too many messages. Please wait before sending another.',
      code: 'RATE_LIMITED',
    }, 429, { 'Retry-After': String(retryAfter) });
  }

  // Parse + validate body
  const body = await c.req.json().catch(() => null);
  const parsed = CreateMessageSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({
      success: false,
      error: parsed.error.errors[0]?.message ?? 'Invalid request',
      code: 'VALIDATION_ERROR',
    }, 400);
  }

  const {
    template_id,
    message,
    recipient_email,   // extracted here, never touches DB
    from_hint,
    bg_color,
    accent,
    font_key,
  } = parsed.data;

  const template = TEMPLATES[template_id];
  if (!template) {
    return c.json({ success: false, error: 'Unknown template', code: 'VALIDATION_ERROR' }, 400);
  }

  const id         = uuidv4();
  const slug       = generateSlug();
  const now        = Math.floor(Date.now() / 1000);
  const expires_at = now + (30 * 24 * 60 * 60); // 30 days
  const baseUrl    = c.env.BASE_URL;

  // Store message in D1 — recipient_email intentionally excluded
  await c.env.DB.prepare(`
    INSERT INTO messages
      (id, slug, template_id, message, from_hint, bg_color, accent, font_key, status, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sent', ?, ?)
  `).bind(id, slug, template_id, message, from_hint ?? null, bg_color ?? null, accent ?? null, font_key ?? null, expires_at, now)
    .run();

  // Send email — recipient_email is used exactly once here, then gone
  const resend = new Resend(c.env.RESEND_API_KEY);
  await sendDeliveryEmail({
    resend,
    recipientEmail: recipient_email,
    slug,
    template,
    fromHint: from_hint ?? null,
    baseUrl,
  });

  return c.json({
    success: true,
    slug,
    message_url: `${baseUrl}/m/${slug}`,
  }, 201);
});

// GET /api/messages/:slug — fetch message for render + mark as read
messages.get('/:slug', async (c) => {
  const { slug } = c.req.param();

  const row = await c.env.DB
    .prepare('SELECT * FROM messages WHERE slug = ?')
    .bind(slug)
    .first<Record<string, unknown>>();

  if (!row) {
    return c.json({ success: false, error: 'Message not found', code: 'NOT_FOUND' }, 404);
  }

  const now = Math.floor(Date.now() / 1000);
  if (row.expires_at as number < now || row.status === 'expired') {
    return c.json({ success: false, error: 'This letter has expired', code: 'EXPIRED' }, 410);
  }

  // Mark as read if first open
  if (!row.read_at) {
    await c.env.DB
      .prepare("UPDATE messages SET status = 'read', read_at = ? WHERE slug = ?")
      .bind(now, slug)
      .run();
    row.status = 'read';
    row.read_at = now;
  }

  // Return everything except id (internal) and never expose recipient email (not stored anyway)
  const { id: _id, ...publicData } = row;
  return c.json({ success: true, data: publicData });
});

// POST /api/messages/:slug/report
messages.post('/:slug/report', async (c) => {
  const { slug } = c.req.param();
  const now = Math.floor(Date.now() / 1000);

  const result = await c.env.DB
    .prepare("UPDATE messages SET status = 'reported', report_at = ? WHERE slug = ? AND status != 'reported'")
    .bind(now, slug)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Not found or already reported', code: 'NOT_FOUND' }, 404);
  }

  return c.json({ success: true });
});

export default messages;
```

### `apps/worker/src/index.ts`

```typescript
import { Hono }    from 'hono';
import { cors }    from 'hono/cors';
import { logger }  from 'hono/logger';
import messages    from './routes/messages';

export interface Env {
  DB:             D1Database;
  RESEND_API_KEY: string;
  BASE_URL:       string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use('/api/*', cors({
  origin: (origin) => origin, // tighten to your domain in production
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));

app.route('/api/messages', messages);
app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }));

export default app;
```

### `apps/worker/wrangler.toml`

```toml
name       = "anonletter-worker"
main       = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding      = "DB"
database_name = "anonletter-db"
database_id  = "REPLACE_WITH_YOUR_D1_ID"

[vars]
BASE_URL = "https://anonletter.app"

# Secrets — set via: wrangler secret put RESEND_API_KEY
# RESEND_API_KEY = (set via wrangler secret)

# Scheduled cleanup — hard-deletes expired messages daily
[[triggers.crons]]
crons = ["0 3 * * *"]   # 3am UTC daily
```

---

## 7. Frontend Implementation

### Zustand Store (`apps/web/src/store/composerStore.ts`)

```typescript
import { create }  from 'zustand';
import type { TemplateId } from '@anonletter/shared';

interface ComposerState {
  // Step 1: Template
  selectedTemplate: TemplateId | null;
  // Step 2: Message
  message: string;
  fromHint: string;
  // Step 3: Customise
  bgColor: string | null;
  accent: string | null;
  fontKey: string | null;
  // Step 4: Recipient
  recipientEmail: string;
  // UI state
  step: 1 | 2 | 3 | 4;
  isSubmitting: boolean;
  submitError: string | null;

  // Actions
  setTemplate:        (id: TemplateId) => void;
  setMessage:         (msg: string) => void;
  setFromHint:        (hint: string) => void;
  setBgColor:         (color: string | null) => void;
  setAccent:          (color: string | null) => void;
  setFontKey:         (key: string | null) => void;
  setRecipientEmail:  (email: string) => void;
  nextStep:           () => void;
  prevStep:           () => void;
  setSubmitting:      (v: boolean) => void;
  setSubmitError:     (err: string | null) => void;
  reset:              () => void;
}

const initial = {
  selectedTemplate: null,
  message: '',
  fromHint: '',
  bgColor: null,
  accent: null,
  fontKey: null,
  recipientEmail: '',
  step: 1 as const,
  isSubmitting: false,
  submitError: null,
};

export const useComposerStore = create<ComposerState>((set) => ({
  ...initial,
  setTemplate:       (id)    => set({ selectedTemplate: id, step: 2 }),
  setMessage:        (msg)   => set({ message: msg }),
  setFromHint:       (hint)  => set({ fromHint: hint }),
  setBgColor:        (color) => set({ bgColor: color }),
  setAccent:         (color) => set({ accent: color }),
  setFontKey:        (key)   => set({ fontKey: key }),
  setRecipientEmail: (email) => set({ recipientEmail: email }),
  nextStep:          ()      => set(s => ({ step: Math.min(4, s.step + 1) as any })),
  prevStep:          ()      => set(s => ({ step: Math.max(1, s.step - 1) as any })),
  setSubmitting:     (v)     => set({ isSubmitting: v }),
  setSubmitError:    (err)   => set({ submitError: err }),
  reset:             ()      => set(initial),
}));
```

### API Client (`apps/web/src/lib/api.ts`)

```typescript
import type {
  CreateMessageRequest,
  CreateMessageResponse,
  GetMessageResponse,
  ApiError,
} from '@anonletter/shared';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json() as T | ApiError;

  if (!res.ok || !(data as any).success) {
    throw new Error((data as ApiError).error ?? 'Something went wrong');
  }

  return data as T;
}

export const api = {
  createMessage: (body: CreateMessageRequest) =>
    request<CreateMessageResponse>('/messages', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMessage: (slug: string) =>
    request<GetMessageResponse>(`/messages/${slug}`),

  reportMessage: (slug: string) =>
    request<{ success: true }>(`/messages/${slug}/report`, { method: 'POST' }),
};
```

### Lenis Hook (`apps/web/src/hooks/useLenis.ts`)

```typescript
import { useEffect } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);
}
```

### Animation Helpers (`apps/web/src/lib/animations.ts`)

```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// SplitText-style word stagger (no plugin needed)
export function splitWords(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? '';
  el.textContent = '';
  el.setAttribute('aria-label', text); // accessibility
  return text.split(' ').map((word, i) => {
    const span = document.createElement('span');
    span.style.cssText = 'display:inline-block;overflow:hidden;';
    const inner = document.createElement('span');
    inner.style.cssText = 'display:inline-block;';
    inner.textContent = i < text.split(' ').length - 1 ? word + '\u00A0' : word;
    span.appendChild(inner);
    el.appendChild(span);
    return inner;
  });
}

// Hero word-by-word entrance
export function animateHeroWords(
  words: HTMLElement[],
  delay = 0
): gsap.core.Tween {
  return gsap.from(words, {
    y: 48,
    opacity: 0,
    skewY: 3,
    stagger: 0.1,
    duration: 0.9,
    delay,
    ease: 'power3.out',
  });
}

// Scroll-triggered fade-up (use on any element)
export function scrollFadeUp(
  el: Element | string,
  opts?: { delay?: number; distance?: number }
) {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none reverse' },
    y: opts?.distance ?? 32,
    opacity: 0,
    duration: 0.9,
    delay: opts?.delay ?? 0,
    ease: 'power3.out',
  });
}

// Magnetic button effect — call on a button element
export function makeMagnetic(el: HTMLElement, strength = 0.2) {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.4, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  });
}

// Template hover — viewport bg color shift
export function templateMoodShift(
  bgEl: HTMLElement,
  moodColor: string,
  defaultColor: string
) {
  return {
    enter: () => gsap.to(bgEl, { background: moodColor, duration: 0.8, ease: 'power2.out' }),
    leave: () => gsap.to(bgEl, { background: defaultColor, duration: 0.6, ease: 'power2.out' }),
  };
}
```

### Composer Flow (`apps/web/src/pages/Compose.tsx`)

```typescript
// Multi-step composer — 4 steps
// Step 1: TemplatePicker
// Step 2: MessageInput + LivePreview
// Step 3: CustomisePanel (accent, font) + RecipientEmail
// Step 4: Review + Submit

import { AnimatePresence, motion } from 'framer-motion';
import { useComposerStore }        from '../store/composerStore';
import { TemplatePicker }          from '../components/composer/TemplatePicker';
import { MessageInput }            from '../components/composer/MessageInput';
import { CustomisePanel }          from '../components/composer/CustomisePanel';
import { RecipientEmail }          from '../components/composer/RecipientEmail';
import { api }                     from '../lib/api';
import { useNavigate }             from 'react-router-dom';

const slideVariants = {
  enter:  (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
};

export function Compose() {
  const store = useComposerStore();
  const navigate = useNavigate();

  async function handleSubmit() {
    if (!store.selectedTemplate || !store.message || !store.recipientEmail) return;
    store.setSubmitting(true);
    store.setSubmitError(null);
    try {
      const res = await api.createMessage({
        template_id:     store.selectedTemplate,
        message:         store.message,
        recipient_email: store.recipientEmail,
        from_hint:       store.fromHint || undefined,
        bg_color:        store.bgColor   || undefined,
        accent:          store.accent    || undefined,
        font_key:        store.fontKey   || undefined,
      });
      navigate(`/success/${res.slug}`);
    } catch (err: any) {
      store.setSubmitError(err.message);
    } finally {
      store.setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0a08] text-[#f2ede6]">
      <AnimatePresence mode="wait" custom={1}>
        <motion.div
          key={store.step}
          custom={1}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          {store.step === 1 && <TemplatePicker />}
          {store.step === 2 && <MessageInput />}
          {store.step === 3 && <CustomisePanel />}
          {store.step === 4 && (
            <RecipientEmail
              onSubmit={handleSubmit}
              isSubmitting={store.isSubmitting}
              error={store.submitError}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

### Message Render Page (`apps/web/src/pages/Message.tsx`)

```typescript
// /m/[slug] — recipient's page. The emotional apex of the product.
// Full animation sequence:
//   1. Stars drift in (canvas particles)
//   2. Envelope descends and floats
//   3. Wax seal dissolves
//   4. Flap folds open (CSS 3D)
//   5. Letter rises from envelope
//   6. On scroll/auto-advance: letter card appears
//   7. Typewriter with human-speed variance
//   8. "from: someone" materializes last
//   9. Read receipt pulse, watermark, report button

// The complete cinematic animation for this page is already prototyped
// in anonletter-night-thought.html (Night Thought template).
// Each template should have its own variant of this sequence using
// its palette, particles, and motif. Night Thought uses stars;
// Soft Bloom uses petals; Quiet Garden uses botanical dust.

import { useEffect, useRef, useState } from 'react';
import { useParams }                   from 'react-router-dom';
import { api }                         from '../lib/api';
import type { Message }                from '@anonletter/shared';

export function MessagePage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData]     = useState<Message | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api.getMessage(slug)
      .then(res => setData(res.data as Message))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LetterLoading />;
  if (error)   return <LetterError message={error} />;
  if (!data)   return null;

  // Render the correct template component
  // Each template component handles its own animation sequence
  return <TemplateRenderer message={data} />;
}

// Loading state — faint parchment lines, NO spinner
function LetterLoading() {
  return (
    <div className="min-h-screen bg-[#0d0e1f] flex items-center justify-center">
      <div className="flex flex-col gap-3 w-64 opacity-20">
        {[80, 100, 65, 90].map((w, i) => (
          <div key={i} className="h-px bg-[#8b90d0] rounded" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}
```

---

## 8. Design System

### Tailwind Config

```typescript
// apps/web/tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{tsx,ts}'],
  theme: {
    extend: {
      colors: {
        // Global dark base
        void:  '#0b0a08',
        ink:   '#0d0c0a',
        // Night Thought palette
        navy:     '#1a1b2e',
        nebula:   '#2d3060',
        mist:     '#8b90d0',
        starlight:'#c8caf0',
        // Soft Bloom palette
        bloom:  { bg: '#fdf0f5', accent: '#f0a0ba' },
        // Old Letter palette
        parchment: { bg: '#fdf6ec', accent: '#c4976a' },
        // Quiet Garden palette
        garden: { bg: '#eaf7f0', accent: '#3B6D11' },
        // Confetti Love palette
        confetti: { bg: '#fff8e7', accent: '#e8c99a' },
        // Global gold
        gold: { DEFAULT: '#c9a96e', light: '#e2c99a' },
      },
      fontFamily: {
        serif:   ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono:    ['Courier New', 'monospace'],
      },
      animation: {
        'float':       'float 4s ease-in-out infinite',
        'pulse-gold':  'pulseGold 2s ease-in-out infinite',
        'twinkle':     'twinkle 3s ease-in-out infinite',
      },
      keyframes: {
        float:      { '0%,100%': {transform:'translateY(0)'}, '50%':{transform:'translateY(-10px)'} },
        pulseGold:  { '0%,100%': {boxShadow:'0 0 6px rgba(201,169,110,0.4)'}, '50%':{boxShadow:'0 0 18px rgba(201,169,110,0.8)'} },
        twinkle:    { '0%,100%': {opacity:'0.2',transform:'scale(1)'}, '50%':{opacity:'0.8',transform:'scale(1.4)'} },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Template Visual Specs

```
SOFT BLOOM
  bg:       #fdf0f5   (blush white)
  accent:   #f0a0ba   (rose)
  text:     #4a2030   (deep wine)
  display:  Playfair Display, italic
  body:     Lato, 300
  motif:    Floating petals (pink/lavender, CSS animation)
  particles: Petal shapes, slow drift, rgba(240,160,186,0.3)
  enter:    Petals drift down as envelope arrives

OLD LETTER
  bg:       #fdf6ec   (aged parchment)
  accent:   #c4976a   (sepia brown)
  text:     #3a2410   (dark ink)
  display:  Courier New (monospaced intentionally — typewriter aesthetic)
  body:     Georgia, serif
  motif:    Parchment texture (CSS grain filter), wax seal bottom
  particles: Dust motes, sepia tone, very slow
  enter:    Paper unfolds from folded thirds (CSS 3D)

NIGHT THOUGHT (full prototype in anonletter-night-thought.html)
  bg:       #1a1b2e   (deep navy)
  accent:   #8b90d0   (mist purple)
  text:     #c8caf0   (starlight)
  display:  Cormorant Garamond, italic
  body:     DM Sans, 300
  motif:    Star field (3-layer canvas parallax — see prototype)
  particles: Stars (3 canvas layers at 0.15x / 0.35x / 0.6x parallax)
  enter:    Stars drift in → envelope → flap → typewriter

QUIET GARDEN
  bg:       #eaf7f0   (sage white)
  accent:   #3B6D11   (forest green)
  text:     #1a3208   (deep green)
  display:  Playfair Display, italic
  body:     Inter, 300
  motif:    Botanical SVG line art (draws itself via stroke-dashoffset)
  particles: Botanical dust, green-tinted, slow float
  enter:    Botanical line art draws in around the letter as it rises

CONFETTI LOVE (the only template where fast animation is correct)
  bg:       #fff8e7   (warm cream)
  accent:   #e8c99a   (gold)
  text:     #4a3010   (warm dark)
  display:  Teko, 700 (bold geometric sans — exception to serif rule)
  body:     Rajdhani, 400
  motif:    Confetti physics burst (canvas, particle physics)
  particles: Confetti pieces, physics drop with gravity, then settle
  enter:    Confetti burst on open, settles over 3 seconds
```

---

## 9. Animation Implementation Rules

These are non-negotiable constraints. Implement them from the start, not as a polish pass.

### Global Rules
1. **Lenis + GSAP ScrollTrigger** is the scroll stack. Initialize Lenis in root layout. Sync via `lenis.on('scroll', ScrollTrigger.update)`.
2. **Never animate the same element with both GSAP and Framer Motion.** GSAP owns scroll animations and page-load sequences. Framer Motion owns route transitions and React component mounts.
3. **Respect `prefers-reduced-motion`.** Wrap GSAP animations in `gsap.matchMedia()` and provide a no-animation fallback.
4. **`will-change: transform`** on all parallax elements. Remove it after the animation completes.
5. **No parallax on mobile** (below 768px breakpoint). Use `gsap.matchMedia()` to disable.

### Per-Page Animation Budget

| Page | Primary Gesture | Everything Else |
|---|---|---|
| Landing `/` | Kinetic word stagger on hero + scroll-scrubbed envelope sequence | Quiet scroll reveals |
| Compose | Framer Motion step transitions (lateral slide) | Template picker background bleed |
| Success | Envelope seal + wax stamp bounce | Copy link magnetic |
| `/m/[slug]` | Full cinematic sequence (see prototype) | Nothing competes |

### The Typewriter Function (human speed — do not make mechanical)
```typescript
function typeMessage(el: HTMLElement, text: string, onDone?: () => void) {
  let i = 0;
  el.textContent = '';

  function next() {
    if (i >= text.length) { onDone?.(); return; }
    const ch = text[i];
    let delay = 28 + Math.random() * 38;
    if (ch === '.')  delay += 220;
    if (ch === ',')  delay += 100;
    if (ch === '\n') delay += 160;
    if (ch === '!')  delay += 180;
    if (ch === '?')  delay += 200;
    el.textContent += ch;
    i++;
    setTimeout(next, delay);
  }
  setTimeout(next, 300); // initial pause before starting
}
```

### Things to NEVER Do
- No bounce/elastic easing on the message render page (reserve for Success page only)
- No hover effects on the message body text itself (it's a letter, not a UI element)
- No autoplay audio of any kind (Spotify embed is opt-in play only)
- No loading spinners — use skeleton parchment lines instead
- No modal upsell on the message page — ever
- No animation on every element — one memorable thing per page, everything else quiet

---

## 10. CI/CD

### `.github/workflows/deploy-web.yml`
```yaml
name: Deploy Web
on:
  push:
    branches: [main]
    paths: ['apps/web/**', 'packages/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install
      - run: pnpm --filter web build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken:    ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId:   ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: anonletter
          directory:   apps/web/dist
```

### `.github/workflows/deploy-worker.yml`
```yaml
name: Deploy Worker
on:
  push:
    branches: [main]
    paths: ['apps/worker/**', 'packages/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install
      - run: pnpm --filter worker build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: apps/worker
```

---

## 11. Environment Variables

```bash
# apps/worker — set via: wrangler secret put RESEND_API_KEY
RESEND_API_KEY=re_xxxxxxxxxxxx

# apps/web — .env.local (never commit)
VITE_API_URL=http://localhost:8787/api   # local dev
# production: /api (same-origin via Pages proxy)
```

### Cloudflare Pages Proxy Config
Add to `apps/web/public/_redirects` or `wrangler.toml` (Pages):
```
/api/* https://anonletter-worker.your-subdomain.workers.dev/api/:splat 200
```
This proxies API calls through Pages to the Worker — same origin, no CORS issues in production.

---

## 12. Phase 0 Build Order

Claude Code should scaffold and implement in this exact order:

```
1.  pnpm monorepo scaffold (root package.json, pnpm-workspace.yaml, biome.json)
2.  packages/shared — types.ts, templates.ts
3.  migrations/0001_init.sql
4.  apps/worker — wrangler.toml, D1 setup, schema.ts
5.  apps/worker — slug.ts, validate.ts, ratelimit.ts
6.  apps/worker — email.ts (Resend HTML builder)
7.  apps/worker — messages.ts route (POST + GET + report)
8.  apps/worker — index.ts (Hono entry, CORS, logger)
9.  apps/web — Vite + React + TS + Tailwind scaffold
10. apps/web — Lenis hook, GSAP setup, animations.ts
11. apps/web — Zustand store (composerStore.ts)
12. apps/web — api.ts client
13. apps/web — TemplatePicker component
14. apps/web — MessageInput + LivePreview
15. apps/web — CustomisePanel + RecipientEmail
16. apps/web — Compose.tsx (multi-step with Framer Motion)
17. apps/web — Home.tsx (landing — refer to anonletter-prototype.html)
18. apps/web — Success.tsx (post-send, envelope seal animation)
19. apps/web — Message.tsx + NightThought.tsx (refer to anonletter-night-thought.html)
20. apps/web — Remaining 4 template render components
21. GitHub Actions CI/CD
22. Wrangler deploy + CF Pages deploy
```

---

## 13. Abuse & Safety (Phase 0 Non-Negotiable)

Do not defer these. Build them alongside core features:

- **Rate limit:** 5 messages per IP per hour (implemented in `ratelimit.ts`)
- **Character cap:** 800 chars enforced on client AND worker (Zod + DB constraint)
- **Email validation:** Zod `z.string().email()` + consider MX record check (Phase 1)
- **Auto-expiry:** Cron Trigger runs daily, hard-deletes rows where `expires_at < now()`
- **Report button:** Every `/m/[slug]` page. No auth required. Sets `status='reported'`.
- **No stored sender info:** The `recipient_email` field must never appear in schema. This is the product's core privacy promise.

---

## 14. Open Source Checklist

```
□ MIT LICENSE in root
□ README.md with one-command local setup
□ CONTRIBUTING.md — template JSON format, PR checklist
□ .env.example (no secrets)
□ docker-compose.yml for self-hosting (Phase 2)
□ GitHub issue labels: bug, enhancement, good first issue, template
□ Code of conduct
```

---

## 15. Reference Files

The following static prototypes were built during design exploration. Use them as the **visual and animation target** for the React implementation:

| File | Use for |
|---|---|
| `anonletter-prototype.html` | Landing page visual target, full animation sequence reference |
| `anonletter-night-thought.html` | `/m/[slug]` Night Thought template — exact animation choreography to port to React |
| `anonletter-inspiration.html` | Design reference map (internal, not shipped) |

The prototypes use GSAP via CDN and vanilla JS. When porting to React:
- Wrap GSAP animations in `useEffect` with `gsap.context()` for proper cleanup
- Use `useRef` for element references, never query the DOM directly
- Return `() => ctx.revert()` from `useEffect` cleanup to kill all GSAP instances

```typescript
// Correct GSAP + React pattern
useEffect(() => {
  const ctx = gsap.context(() => {
    // all your gsap.from(), gsap.to(), ScrollTrigger.create() calls here
  }, containerRef); // scoped to this component

  return () => ctx.revert(); // cleanup on unmount
}, []);
```

---

*AnonLetter · MIT License · Built by Rahul · Cloudflare-native · The feeling is the feature.*
