import { Hono } from "hono";
import { createSession, deleteSession } from "../session";

const auth = new Hono();

const LIFE_TIME_IN_SECS = 60 * 60;

auth.post("/login", async (c) => {
  const { username, password } = await c.req.json();

  if (username === "admin" && password === "secret") {
    const sessionId = createSession("adminUserId", LIFE_TIME_IN_SECS);

    c.header(
      "Set-Cookie",
      `sessionId=${sessionId}; HTTPOnly; Secure; SameSite=Strict; Path=/; MaxAge=${LIFE_TIME_IN_SECS}`,
    );

    return c.json({ message: "logged in" });
  }

  return c.json({ error: "Invalid credentials" }, 401);
});

auth.post("/logout", async (c) => {
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match("/sessionId=([^;]+)/");

  if (match) {
    deleteSession(match[1]);
  }

  // expire session
  c.header(
    "Set-Cookie",
    `sessionId=; HTTPOnly; Secure; SameSite=Strict; Path=/; MaxAge=0`,
  );

  return c.json({ message: "logged out" });
});

export default auth;
