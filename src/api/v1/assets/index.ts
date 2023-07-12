import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import { createHono } from "lib/constant";
import { getOrRefreshCredential } from "lib/credential";
import { Drive, driveErrHandler } from "lib/drive_item";
import { assetScope } from "lib/types/assets";
import { z } from "zod";

export const assets = createHono()
  .use(
    "/*",
    async (ctx, next) =>
      await cors({
        origin: ctx.env.ALLOW_HOST_LIST.split(","),
        exposeHeaders: ["GET"],
      })(ctx, next)
  )

  .use(async (ctx, next) => {
    console.log("assets middleware");
    ctx.set("accessToken", await getOrRefreshCredential(ctx.env));

    await next();
  })

  .get(
    "/:scope/item",
    zValidator(
      "query",
      z.object({
        filePath: z.string(),
      })
    ),
    async (ctx) => {
      const accessToken = ctx.get("accessToken");
      const { filePath } = ctx.req.valid("query");
      const scope = assetScope.parse(ctx.req.param("scope"));
      const drive = new Drive(scope, accessToken);

      try {
        const item = await drive.getItem(filePath);
        return ctx.jsonT({ item });
      } catch (err) {
        return driveErrHandler(err);
      }
    }
  )

  .get(
    "/:scope/children",
    zValidator(
      "query",
      z.object({
        dirPath: z.string(),
      })
    ),
    async (ctx) => {
      const accessToken = ctx.get("accessToken");
      const { dirPath } = ctx.req.valid("query");
      const scope = assetScope.parse(ctx.req.param("scope"));
      const drive = new Drive(scope, accessToken);

      try {
        const [item, children] = await Promise.all([
          drive.getItem(dirPath),
          drive.getChildren(dirPath),
        ]);
        return ctx.jsonT({ item, children });
      } catch (err) {
        return driveErrHandler(err);
      }
    }
  );
