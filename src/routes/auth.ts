import { Hono } from "hono";
import { createSession, deleteSession } from "../session";
import { db } from "../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const auth = new Hono();

const LIFE_TIME_IN_SECS = 60 * 60;

auth.post("/register", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "missing credentials" }, 400);
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    return c.json({ error: "User already exists" }, 409);
  }

  const hash = await bcrypt.hash(password, 10);

  await db
    .insert(users)
    .values({
      email,
      passwordHash: hash,
    })
    .returning();

  // optionally you can auto login but i'll skip as it doesn't feel normal to me.

  return c.json({ message: "Registered" });
});

auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "missing credentials" }, 400);
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const sessionId = await createSession(user.id, LIFE_TIME_IN_SECS);

  c.header(
    "Set-Cookie",
    `sessionId=${sessionId}; HTTPOnly; Secure; SameSite=Strict; Path=/; MaxAge=${LIFE_TIME_IN_SECS}`,
  );

  return c.json({ message: "logged in" });
});

auth.post("/logout", async (c) => {
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match("/sessionId=([^;]+)/");

  if (match) {
    await deleteSession(match[1]);
  }

  // expire session
  c.header(
    "Set-Cookie",
    `sessionId=; HTTPOnly; Secure; SameSite=Strict; Path=/; MaxAge=0`,
  );

  return c.json({ message: "logged out" });
});

export default auth;
