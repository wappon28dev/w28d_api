import { zValidator } from "@hono/zod-validator";
import { type HonoType } from "lib/constant";
import { Drive } from "lib/drive";
import { z } from "zod";
import { sendAnalyticsEventAssets } from "lib/analytics";
import {
  authGuard,
  configureCors,
  injectGraphClient,
} from "lib/middlewares/asset";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { resValidator } from "lib/types/res_req";

export const assets = new Hono<HonoType>()
  // preflight
  .options("*", cors())
  .use("/:key/*", authGuard, configureCors, injectGraphClient)

  .get(
    "/:key/item",
    zValidator(
      "query",
      z.object({
        filePath: z.string().min(1),
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
    "/:key/item/raw",
    zValidator(
      "query",
      z.object({
        filePath: z.string().min(1),
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
          operation: "itemRaw",
          fileOrDirPath: filePath,
        },
      });

      const downloadUrl = await drive.getFileDownloadUrl(filePath);
      return ctx.redirect(downloadUrl, 303);
    }
  )

  .get(
    "/:key/children",
    zValidator(
      "query",
      z.object({
        dirPath: z.string().min(1),
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

  .get(
    "/:key/children/flat",
    zValidator(
      "query",
      z.object({
        dirPath: z.string().min(1),
      })
    ),
    async (ctx) => {
      const { graphClient: client, assetManifest: manifest } = ctx.var;
      const { dirPath } = ctx.req.valid("query");

      await sendAnalyticsEventAssets(ctx.env, ctx.req.header("referer"), {
        name: "assets",
        params: {
          key: ctx.req.param("key"),
          operation: "childrenFlat",
          fileOrDirPath: dirPath,
        },
      });

      const drive = new Drive(client, manifest);
      const childrenFlat = await drive.getChildrenFlat();
      const joinedPath = Drive.joinPath([manifest.basePath, dirPath], true);

      const flat: z.infer<(typeof resValidator)["getChildrenFlat"]> =
        childrenFlat.value
          // `dirPath` にマッチするものだけを抽出
          // TODO: API の `$filter` でフィルタリングするように修正する
          .filter((item) => item.driveItem.webUrl.includes(joinedPath))
          .map((item) => {
            const filePath = Drive.joinPath([
              manifest.basePath,
              item.driveItem.webUrl.split(joinedPath)[1],
            ]);

            return {
              downloadUrl: item.driveItem["@microsoft.graph.downloadUrl"],
              name: item.driveItem.name,
              size: item.driveItem.size,
              filePath,
              lastModifiedDateTime: item.lastModifiedDateTime,
            };
          });

      const zFlat = resValidator.getChildrenFlat;
      return ctx.json(zFlat.parse(flat));
    }
  )

  .post(
    "/:key/item",
    zValidator(
      "query",
      z.object({
        filePath: z.string().min(1),
      })
    ),
    async (ctx) => {
      const { graphClient: client, assetManifest: manifest } = ctx.var;
      const { filePath } = ctx.req.valid("query");

      const drive = new Drive(client, manifest);
      const uploadSession = await drive.createUploadSession(filePath);

      return ctx.json(uploadSession);
    }
  );
