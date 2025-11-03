import { Hono } from "hono";
import { authMiddleware } from "../middleware";

const user = new Hono();

user.use("*", authMiddleware);

user.get("/", async (c) => {
  const userId = c.get("userId");

  return c.json({ userId, info: "this is protected data" });
});

export default user;
