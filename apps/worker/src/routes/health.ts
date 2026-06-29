import { Hono } from "hono";
import type { Env } from "../env";

export const health = new Hono<{ Bindings: Env }>().get("/", (c) =>
  c.json({ success: true, service: "anonletter-worker" })
);
