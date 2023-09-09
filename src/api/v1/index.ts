import { createHono } from "lib/constant";
import { assets } from "./assets";

export const v1 = createHono()
  .use("/*", async (ctx, next) => {
    Object.entries(ctx.env).forEach(([key, value]) => {
      if (value == null) throw new Error(`key: "${key}" is null`);
    });
    await next();
  })
  .route("/assets", assets);
