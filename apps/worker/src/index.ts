import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env } from "./env";
import { health } from "./routes/health";
import { messages } from "./routes/messages";

const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://anonletter.dev"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"]
  })
);

app.route("/health", health);
app.route("/messages", messages);

app.notFound((c) => c.json({ success: false, code: "NOT_FOUND", error: "Route not found." }, 404));

app.onError((error, c) => {
  console.error(error);
  return c.json({ success: false, code: "INTERNAL_ERROR", error: "Something went wrong." }, 500);
});

export default app;
