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

  .route("/public", publicRouter)
  .route("/protected", protectedRouter);
