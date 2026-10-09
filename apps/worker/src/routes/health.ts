import { Hono } from "hono";
import type { Env } from "../env";

export const health = new Hono<{ Bindings: Env }>().get("/", async (c) => {
  const db = await c.env.DB.prepare("SELECT 1 AS ok")
    .first()
    .then(() => true)
    .catch(() => false);
  return c.json({ success: db, service: "anonletter-worker", db, ts: Date.now() }, db ? 200 : 503);
});
