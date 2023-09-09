import { v1 } from "api/v1";
import { createHono } from "lib/constant";

const app = createHono();

const route = app
  .get("/", async (ctx) => ctx.jsonT("Hello World!"))
  .route("/v1", v1);

export type AppType = typeof route;
export default app;
