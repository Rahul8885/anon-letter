# Unsaid

Send someone a beautiful anonymous letter in under two minutes, no account needed.

## Local Setup

```bash
pnpm install
cp apps/worker/.dev.vars.example apps/worker/.dev.vars
pnpm db:migrate:local
pnpm dev:worker   # API on :8787 (emails are logged to the console, not sent)
pnpm dev:web      # site on :5173, proxies /api to the worker
```

Run the API tests with `pnpm test`. Production setup (Cloudflare D1, Resend, Pages, CI) is in [BACKEND_SETUP.md](BACKEND_SETUP.md).
