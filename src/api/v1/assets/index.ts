import { zValidator } from "@hono/zod-validator";
import { type HonoType } from "lib/constant";
import { Drive } from "lib/drive";
import { z } from "zod";
import { sendAnalyticsEventAssets } from "lib/analytics";
import { LargeFileUploadTask } from "@microsoft/microsoft-graph-client";
import {
  authGuard,
  configureCors,
  injectGraphClient,
  injectReqMode,
} from "lib/middlewares/asset";
import { Hono } from "hono";
import { cors } from "hono/cors";

export const assets = new Hono<HonoType>()
  // preflight
  .options("*", cors())
  .use("/:key/*", injectReqMode, authGuard, configureCors, injectGraphClient)

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
