// here, I'm handling the state of this stateful authentication...

import { eq } from "drizzle-orm";
import { db } from "./db";
import { sessions } from "./schema";

type Session = {
  id: number;
  sessionId: string;
  userId: number;
  expiresAt: Date;
};

export async function createSession(
  userId: number,
  lifetimeInSeconds: number,
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + lifetimeInSeconds * 1000);

  await db.insert(sessions).values({
    sessionId,
    userId,
    expiresAt,
  });

  return sessionId;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const [sess] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.sessionId, sessionId));

  if (!sess) return null;

  if (sess.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.sessionId, sessionId));

    return null;
  }

  return sess;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.sessionId, sessionId));
}
