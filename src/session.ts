// here, I'm handling the state of this stateful authentication...

import { db } from "./db";
import { sessions } from "./schema";

type Session = {
  userId: number;
  expiresAt: number;
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

export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);

  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);

    return null;
  }

  return session;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}
