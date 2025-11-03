import { Hono } from "hono";
import auth from "./routes/auth";
import user from "./routes/user";

const app = new Hono();

app.get("/", async (c) => {
  return c.text("hello Hono!");
});

app.route("/auth", auth);
app.route("/user", user);

export default app;
