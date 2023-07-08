import { createHono } from "lib/constant";
import { v1 } from "./api/v1/index";

const app = createHono();

app
  .get("/", async (ctx) => ctx.jsonT("Hello World!"))
  .all("/", async (ctx) => ctx.jsonT(""))
  .route("/v1", v1);

export default app;
