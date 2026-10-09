import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import type { Env } from "./env";
import { purgeExpired } from "./lib/cleanup";
import { health } from "./routes/health";
import { messages } from "./routes/messages";

const app = new Hono<{ Bindings: Env }>().basePath("/api");

// logs method, path and status only — request bodies (and so recipient emails) never reach the log
app.use("*", logger());
app.use("*", secureHeaders());
app.use("*", (c, next) =>
  cors({
    origin: (c.env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400,
  })(c, next),
);
app.use(
  "*",
  bodyLimit({
    maxSize: 16 * 1024,
    onError: (c) =>
      c.json({ success: false, code: "VALIDATION_ERROR", error: "Request is too large." }, 413),
  }),
);

app.route("/health", health);
app.route("/messages", messages);

app.notFound((c) => c.json({ success: false, code: "NOT_FOUND", error: "Route not found." }, 404));

app.onError((error, c) => {
  console.error(error);
  return c.json({ success: false, code: "INTERNAL_ERROR", error: "Something went wrong." }, 500);
});

export default {
  fetch: app.fetch,
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      purgeExpired(env.DB).then((purged) =>
        console.log(`[cron] purged ${purged.letters} letters, ${purged.windows} rate windows`),
      ),
    );
  },
} satisfies ExportedHandler<Env>;

export { app };
