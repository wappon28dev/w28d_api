import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import { createHono, getAssetsManifests } from "lib/constant";
import { getOrRefreshCredential } from "lib/credential";
import { Drive } from "lib/drive";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { sendAnalyticsEventAssets } from "lib/analytics";
import { Client, LargeFileUploadTask } from "@microsoft/microsoft-graph-client";

export const assets = createHono()
  .use("/:key/*", async (ctx, next) => {
    console.log("manifest middleware");

    const key = ctx.req.param("key");
    const manifest = getAssetsManifests(ctx.env)[key];

    if (manifest == null) return ctx.notFound();
    ctx.set("assetManifest", manifest);

    return await cors({
      origin: manifest.allowedHosts,
      exposeHeaders: ["GET"],
    })(ctx, next);
  })

  // secure guard
  .use("*", async (ctx, next) => {
    console.log("secure guard");

    const manifest = ctx.var.assetManifest;
    const { allowedHosts, accessKey } = manifest;

    const referer = ctx.req.header("referer");

    if (referer == null) {
      throw new HTTPException(400, { message: "referer header is required" });
    }

    if (!allowedHosts.some((host) => referer.startsWith(host))) {
      console.log(allowedHosts, referer);
      throw new HTTPException(403);
    }

    return await bearerAuth({ token: accessKey })(ctx, next);
  })

  .use("/:key/*", async (ctx, next) => {
    console.log("assets middleware");
    const graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => getOrRefreshCredential(ctx.env),
      },
    });
    ctx.set("graphClient", graphClient);

    await next();
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
      const { graphClient: client, assetManifest: manifest } = ctx.var;
      const { filePath } = ctx.req.valid("query");

      const drive = new Drive(client, manifest);

      await sendAnalyticsEventAssets(ctx.env, ctx.req.header("referer"), {
        name: "assets",
        params: {
          key: ctx.req.param("key"),
          operation: "item",
          fileOrDirPath: filePath,
        },
      });

      const item = await drive.getItem(filePath);
      return ctx.json({ item });
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
      const { graphClient: client, assetManifest: manifest } = ctx.var;
      const { dirPath } = ctx.req.valid("query");

      await sendAnalyticsEventAssets(ctx.env, ctx.req.header("referer"), {
        name: "assets",
        params: {
          key: ctx.req.param("key"),
          operation: "children",
          fileOrDirPath: dirPath,
        },
      });

      const drive = new Drive(client, manifest);

      const [item, children] = await Promise.all([
        drive.getItem(dirPath),
        drive.getChildren(dirPath),
      ]);
      return ctx.json({ item, children });
    }
  )

  .post(
    "/:key/item",
    zValidator(
      "query",
      z.object({
        filePath: z.string(),
      })
    ),
    async (ctx) => {
      const { graphClient: client, assetManifest: manifest } = ctx.var;
      const { filePath } = ctx.req.valid("query");

      const uploadSession = await LargeFileUploadTask.createUploadSession(
        client,
        [
          "drives",
          manifest.driveId,
          "root:",
          manifest.distPath,
          `${filePath}:`,
          "createUploadSession",
        ].join("/"),
        {}
      );

      return ctx.json(uploadSession);
    }
  );
