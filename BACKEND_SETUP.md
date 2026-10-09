# Backend setup, integration and running

This covers the API in `apps/worker`: what it does, how to run it locally, the things you have to set up outside the code (Cloudflare, Resend, DNS, GitHub), and how it connects to the web app.

---

## 1. What the backend is

A Cloudflare Worker (Hono) backed by a Cloudflare D1 (SQLite) database. Email goes out through Resend's REST API.

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/health` | Liveness and DB check. Returns `503` if D1 is unreachable. |
| `POST` | `/api/messages` | Validates and stores the letter, then emails the recipient (`delivery_method: "email"`, the default) or only returns a share link (`"link"`). Returns `201 { success, slug, message_url }`. |
| `GET` | `/api/messages/:slug` | Returns the letter (without its internal `id`). The first open sets `read_at` and the `read` status. Returns `404` for an unknown slug, `410` once expired. |
| `POST` | `/api/messages/:slug/report` | Marks the letter `reported`. Idempotent, no auth. |
| `GET` | `/api/messages/templates/all` | Template registry from `packages/shared`. |
| cron | `0 3 * * *` (03:00 UTC) | Hard-deletes expired letters (older than 30 days) and stale rate-limit rows. |

Errors always look like `{ success: false, code, error }`, where `code` is one of `VALIDATION_ERROR | RATE_LIMITED | NOT_FOUND | EXPIRED | INTERNAL_ERROR`. `error` is a sentence the composer can show to the user as is.

**Privacy guarantees enforced in code (and covered by tests):**
- `recipient_email` is never written to D1 and never logged. It goes into one request to Resend and nothing else.
- IPs are stored only as `SHA-256(IP_HASH_SALT + ip)` in `rate_limits`, and those rows are purged daily.
- If the email fails to send, the stored letter is deleted and the API returns `502`, so no orphan letter is left behind.

**Abuse limits:** 5 letters per IP per hour (only valid requests count), an 800-character message cap enforced in both Zod and the SQL `CHECK`, a 16 KB body limit, and strict 8-character slug validation.

### Files

```
apps/worker/
  wrangler.toml            # bindings, production vars, cron, migrations dir
  .dev.vars.example        # local-only settings → copy to .dev.vars
  src/index.ts             # Hono app: logger, secure headers, CORS, body limit, cron handler
  src/env.ts               # typed bindings and vars
  src/routes/messages.ts   # create / read / report
  src/routes/health.ts
  src/lib/validate.ts      # Zod request schema
  src/lib/email.ts         # Resend REST call and email HTML/text
  src/lib/ratelimit.ts     # atomic per-IP hourly counter
  src/lib/slug.ts          # unbiased crypto slug and validator
  src/lib/cleanup.ts       # daily purge
migrations/0001_init.sql   # D1 schema (the source of truth)
.github/workflows/deploy-worker.yml
```

---

## 2. Run it locally (no accounts needed)

Local dev uses Wrangler's built-in local D1 and `EMAIL_MODE=log`. Instead of sending an email, the worker prints the letter link to its console. You don't need a Cloudflare login or a Resend key for this.

```bash
# 1. install (once)
pnpm install

# 2. local worker settings (once)
cp apps/worker/.dev.vars.example apps/worker/.dev.vars

# 3. create the local database tables (once, and again after any new migration)
pnpm db:migrate:local

# 4. run both servers, in two terminals
pnpm dev:worker     # API on http://localhost:8787
pnpm dev:web        # site on http://localhost:5173
```

Open http://localhost:5173 and write a letter.
- **Link delivery:** you land on the success page with the link.
- **Email delivery:** the worker terminal prints `[email:log] letter ready at http://localhost:5173/m/xxxxxxxx`. Open that link to see the recipient's view.

**How the web app reaches the API locally:** `apps/web/vite.config.ts` proxies `/api` to `127.0.0.1:8787`. The frontend already defaults to `/api`, so you don't need `VITE_API_URL` locally. Phones on your LAN that open `http://<your-ip>:5173` work too.

### Test and check

```bash
pnpm test                                   # 24 worker tests (vitest)
pnpm --filter @anonletter/worker check      # typecheck
curl http://localhost:8787/api/health
```

To trigger the daily cleanup by hand while `dev:worker` is running:
```bash
curl "http://localhost:8787/__scheduled?cron=0+3+*+*+*"
```

### Sending real email locally (optional)

In `apps/worker/.dev.vars`, set `EMAIL_MODE=resend` and `RESEND_API_KEY=re_...`. Without a verified domain, keep `EMAIL_FROM=SAYLESS <onboarding@resend.dev>`. Resend only lets that sender deliver to **your own Resend account email**, so use that address as the recipient.

### Inspecting the local DB

```bash
cd apps/worker
pnpm exec wrangler d1 execute anonletter --local --command "SELECT slug, status, read_at FROM messages"
```

> **Windows note:** `npx wrangler ... --command "A; B"` can split the SQL into separate arguments. Use `pnpm exec wrangler`, or put the SQL in a file and pass `--file path.sql`.

### Resetting the local rate limit

If you send more than 5 letters in an hour while testing, you'll get `429`. To reset:
```bash
pnpm exec wrangler d1 execute anonletter --local --command "DELETE FROM rate_limits"
```

---

## 3. What you need to do outside the code

Do these once, in this order. Run the commands from `apps/worker/` unless a step says otherwise.

### 3.1 Cloudflare account and Wrangler login

1. Create a free account at https://dash.cloudflare.com.
2. Log in from your machine:
   ```bash
   cd apps/worker
   pnpm exec wrangler login
   ```

### 3.2 Create the production D1 database

```bash
pnpm exec wrangler d1 create anonletter
```

This prints a `database_id`. Paste it into `apps/worker/wrangler.toml`, replacing `replace-with-d1-id`, and commit the change. The id is not a secret.

Then create the tables in the remote database:
```bash
pnpm exec wrangler d1 migrations apply anonletter --remote
```

### 3.3 Resend: domain and API key

1. Create an account at https://resend.com. The free tier allows 3,000 emails a month and 100 a day.
2. **Domains → Add Domain.** Use a domain you own. A subdomain such as `mail.yourdomain.com` is recommended.
3. Add the DNS records Resend shows you (SPF/MX `TXT`, the DKIM `TXT`, and optionally DMARC) at your DNS provider, then wait until Resend shows the domain as **Verified**.
   - Without a verified domain, Resend only delivers to your own account email. Real users won't receive anything.
4. **API Keys → Create** with *Sending access*. Copy the `re_...` key.

### 3.4 Set the production configuration

Edit `[vars]` in `apps/worker/wrangler.toml`:

| Var | Set it to |
|---|---|
| `PUBLIC_BASE_URL` | The public URL of the website, with no trailing slash, e.g. `https://sayless.pages.dev` or `https://yourdomain.com`. Letter links in emails are built from this. |
| `ALLOWED_ORIGINS` | The website origin or origins, comma-separated. Only needed if the site calls the API cross-origin (option B below). |
| `EMAIL_FROM` | `SAYLESS <letters@your-verified-domain>` |
| `EMAIL_MODE` | `resend` |

Set the secrets. They are stored encrypted in Cloudflare and never go in git:
```bash
pnpm exec wrangler secret put RESEND_API_KEY      # paste the re_... key
pnpm exec wrangler secret put IP_HASH_SALT        # paste a long random string, e.g. from:
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

> **Warning:** Don't change `IP_HASH_SALT` casually. Changing it only resets the current hour's rate limits, which is harmless. But if it leaks, hashed IPs in `rate_limits` become easy to brute-force back into real IPs.

### 3.5 Deploy the worker

```bash
pnpm exec wrangler deploy
```

Note the URL it prints, e.g. `https://anonletter-worker.<your-subdomain>.workers.dev`, then check it:
```bash
curl https://anonletter-worker.<your-subdomain>.workers.dev/api/health
```

### 3.6 Deploy the website (Cloudflare Pages)

In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and pick this repository. Use these settings:

| Setting | Value |
|---|---|
| Production branch | `master` |
| Framework preset | None |
| Build command | `pnpm install && pnpm --filter @anonletter/web build` |
| Build output directory | `apps/web/dist` |
| Root directory | *(leave empty, the repo root)* |
| Env var `NODE_VERSION` | `20` |
| Env var `VITE_API_URL` | Only for option B below |

`apps/web/public/_redirects` holds the SPA fallback, so `/m/<slug>` loads the app.

### 3.7 Connect the website to the API (pick one)

**Option A: same domain. Recommended once you have a domain on Cloudflare.**
1. Add your domain to Cloudflare and attach it to the Pages project (**Pages → Custom domains**).
2. In `wrangler.toml`, uncomment and edit:
   ```toml
   routes = [{ pattern = "yourdomain.com/api/*", zone_name = "yourdomain.com" }]
   ```
3. Set `PUBLIC_BASE_URL = "https://yourdomain.com"` and redeploy the worker.
4. **Don't** set `VITE_API_URL`. The site calls `/api/...` on its own origin and the Worker route answers it, so you don't need CORS.

**Option B: separate origins. Works immediately on free `*.pages.dev` and `*.workers.dev`.**
1. In the Pages project, set the env var `VITE_API_URL = https://anonletter-worker.<your-subdomain>.workers.dev/api` and redeploy the site. Vite bakes this in at build time.
2. In `wrangler.toml`, set `ALLOWED_ORIGINS = "https://<your-project>.pages.dev"` and `PUBLIC_BASE_URL` to the same URL. Redeploy the worker.
3. Preview deployments (`https://<hash>.<project>.pages.dev`) are different origins. Add them to `ALLOWED_ORIGINS` if you want previews to send letters.

> Cloudflare Pages `_redirects` **cannot proxy to an external domain**. The old line `/api/* https://...workers.dev/... 200` would have quietly served `index.html` for API calls, so it has been removed.

### 3.8 Automatic deploys (GitHub Actions)

`.github/workflows/deploy-worker.yml` runs on pushes to `master` that touch the worker, the shared package or migrations. It typechecks, runs the tests, applies any new D1 migrations, and deploys.

Add these in **GitHub → repo → Settings → Secrets and variables → Actions**:
| Secret | Where to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Dashboard → My Profile → API Tokens → Create Token → *Edit Cloudflare Workers* template, then also add **Account → D1 → Edit**. |
| `CLOUDFLARE_ACCOUNT_ID` | Dashboard → Workers & Pages → the right-hand sidebar. |

`RESEND_API_KEY` and `IP_HASH_SALT` stay as Worker secrets (step 3.4). CI doesn't need them.

The website deploys through the Pages Git integration from step 3.6, so it doesn't need a workflow.

---

## 4. Go-live checklist

- [ ] `/api/health` on the production URL returns `{"success":true,...,"db":true}`
- [ ] Send a **link** letter from the live site, open the link, and check that the letter renders
- [ ] Send an **email** letter to an address you control (not your Resend account email) and check that it arrives, is not in spam, and that the button opens the letter
- [ ] Click **Report** on that letter and check that it shows "Reported"
- [ ] Send 6 letters quickly and check that the 6th gets the "Too many letters" toast
- [ ] `pnpm exec wrangler tail` shows requests, and no recipient addresses appear anywhere in the logs

---

## 5. Operating it

```bash
cd apps/worker
pnpm exec wrangler tail                                  # live logs

# reported letters
pnpm exec wrangler d1 execute anonletter --remote --command \
  "SELECT slug, template_id, message, report_at FROM messages WHERE status = 'reported'"

# take one down immediately
pnpm exec wrangler d1 execute anonletter --remote --command \
  "DELETE FROM messages WHERE slug = 'xxxxxxxx'"
```

**Schema changes:** add `migrations/0002_<name>.sql`, run `pnpm db:migrate:local`, test, and commit. CI applies the migration remotely. To apply it by hand, run `pnpm db:migrate:remote`.

**Free-tier ceilings:** Workers allow 100k requests a day, D1 allows 5M reads a day, and Resend allows 100 emails a day / 3k a month. Resend's daily cap is the one you'll hit first. When it's reached, sends fail with `502` and the letter is not stored.

---

## 6. Where this differs from `ANONLETTER_CLAUDE_CODE.md`, and why

| Spec | Built | Reason |
|---|---|---|
| Resend SDK | Direct `fetch` to `api.resend.com/emails` | The SDK pulls in `@react-email/render`, which took the bundle from 212 KB to 1.4 MB. It also returns errors instead of throwing, and the old code ignored them, so failed sends looked successful. |
| Drizzle ORM | Plain D1 prepared statements; `drizzle-orm` removed | The spec's own route code uses raw SQL, and with three tables Drizzle adds a dependency without adding safety. `migrations/0001_init.sql` is the schema. |
| `BASE_URL` | `PUBLIC_BASE_URL`, plus `ALLOWED_ORIGINS`, `EMAIL_FROM`, `EMAIL_MODE`, `IP_HASH_SALT` | Matches the frontend's existing naming. Nothing domain-specific is hard-coded. |
| Rate limit checked before validation | After validation | Typos and invalid emails don't use up the sender's 5 letters per hour. |
| Report on an already-reported letter returns `404` | Returns `200` | A double-click shouldn't show the recipient an error. |
| Recipient email only | Email **or** link delivery | The frontend already offers both. Link delivery never contacts Resend. |
| Footer link to `/report/:slug` | "Open it and use Report" | The frontend has no `/report` route. Reporting happens on the letter page. |

Reported letters are still viewable by whoever has the link, and are purged at expiry like any other letter. If you'd rather hide them right away, make `GET /api/messages/:slug` return `410` when `status = 'reported'`.
