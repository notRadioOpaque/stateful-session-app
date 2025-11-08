import { Hono } from "hono";
import auth from "./routes/auth";
import user from "./routes/users";

const app = new Hono();

app.get("/", async (c) => {
  return c.text("hello Hono!");
});

app.route("/auth", auth);
app.route("/users", user);

export default app;
