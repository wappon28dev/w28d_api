import { cors } from "hono/cors";
import { createHono } from "lib/constant";
import { getOrRefreshCredential } from "lib/credential";
import { protectedRouter } from "./protected";
import { publicRouter } from "./public";

export const assets = createHono()
  .use(async (ctx, next) => {
    console.log("assets middleware");
    ctx.set("accessToken", await getOrRefreshCredential(ctx.env));

    await next();
  })

  .use("/*", async (ctx, next) =>
    await cors({
      origin: ctx.env.ALLOW_HOST_LIST.split(","),
      exposeHeaders: ["GET"],
    })(ctx, next)
  )

  .route("/public", publicRouter)
  .route("/protected", protectedRouter);
