import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";

import { nanoid } from "nanoid";
import { createClient } from "@vercel/kv";

export const config = {
  runtime: "edge",
};

const kv = createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const app = new Hono();

app.use("*", cors());

app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const value = await kv.get<string>(id);

  return c.redirect(value || "/");
});

app.post("/api/shorten", async (c) => {
  const body: { url: string } = await c.req.json();
  const short_url = nanoid(4);

  const url_result = c.req.url.replace(c.req.path, "/") + short_url;

  await kv.set(short_url, body.url);

  return c.json({ url_result });
});

export default handle(app);
