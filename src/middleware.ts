import { Context, Next } from "hono";
import { getSession } from "./session";

export async function authMiddleware(c: Context, next: Next) {
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(/\bsessionId=([^;]+)/);

  if (!match) return c.json({ error: "unathorized" }, 401);

  const sessionId = match[1];
  const session = await getSession(sessionId);

  if (!session) return c.json({ error: "unathorized" }, 401);

  // attach user context
  c.set("userId", session.userId.toString());

  return next();
}
