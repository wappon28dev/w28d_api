import { createHono } from "lib/constant";

const app = createHono();

app.use("*", async (ctx, next) => {
  await next();
});

app.get("/", async (ctx) => {});

export default app;
