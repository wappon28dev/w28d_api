import { type HonoType } from "lib/constant";
import { Hono } from "hono";
import { assets } from "./assets";

export const v1 = new Hono<HonoType>()
  .use("/*", async (ctx, next) => {
    Object.entries(ctx.env).forEach(([key, value]) => {
      if (value == null) throw new Error(`key: "${key}" is null`);
    });
    await next();
  })
  .route("/assets", assets);
