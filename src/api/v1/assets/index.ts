import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import { createHono, getAssetsManifests } from "lib/constant";
import { getOrRefreshCredential } from "lib/credential";
import { Drive, driveErrHandler } from "lib/drive";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { sendAnalyticsEventAssets } from "lib/analytics";

export const assets = createHono()
  .use("/:key/*", async (ctx, next) => {
    console.log("assets middleware");
    ctx.set("accessToken", await getOrRefreshCredential(ctx.env));

    await next();
  })

  .use("/:key/*", async (ctx, next) => {
    console.log("manifest middleware");

    const key = ctx.req.param("key");
    const manifest = getAssetsManifests(ctx.env)[key];

    if (manifest == null) return await ctx.notFound();
    ctx.set("assetManifest", manifest);

    return await cors({
      origin: manifest.allowedHosts,
      exposeHeaders: ["GET"],
    })(ctx, next);
  })

  // secure guard
  .use("/:key/*", async (ctx, next) => {
    console.log("secure guard");

    const manifest = ctx.get("assetManifest");
    const { allowedHosts, accessKey } = manifest;

    const referer = ctx.req.header("referer");

    if (referer == null) {
      throw new HTTPException(400, { message: "referer header is required" });
    }

    if (referer in allowedHosts) {
      throw new HTTPException(403);
    }

    return await bearerAuth({ token: accessKey })(ctx, next);
  })

  .get(
    "/:key/item",
    zValidator(
      "query",
      z.object({
        filePath: z.string(),
      })
    ),
    async (ctx) => {
      console.log("item");

      const manifest = ctx.get("assetManifest");
      const accessToken = ctx.get("accessToken");
      const { filePath } = ctx.req.valid("query");

      const drive = new Drive(accessToken, manifest);

      await sendAnalyticsEventAssets(ctx.env, ctx.req.header("referer"), {
        name: "assets",
        params: {
          key: ctx.req.param("key"),
          operation: "item",
          fileOrDirPath: filePath,
        },
      });

      try {
        const item = await drive.getItem(filePath);
        return ctx.jsonT({ item });
      } catch (err) {
        return driveErrHandler(err);
      }
    }
  )

  .get(
    "/:key/children",
    zValidator(
      "query",
      z.object({
        dirPath: z.string(),
      })
    ),
    async (ctx) => {
      const manifest = ctx.get("assetManifest");
      const accessToken = ctx.get("accessToken");
      const { dirPath } = ctx.req.valid("query");

      await sendAnalyticsEventAssets(ctx.env, ctx.req.header("referer"), {
        name: "assets",
        params: {
          key: ctx.req.param("key"),
          operation: "children",
          fileOrDirPath: dirPath,
        },
      });

      const drive = new Drive(accessToken, manifest);

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
