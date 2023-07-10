import { zValidator } from "@hono/zod-validator";
import { createHono } from "lib/constant";
import { Drive, driveErrHandler } from "lib/drive_item";

import { z } from "zod";

export const publicRouter = createHono()
  .get(
    "/item",
    zValidator(
      "query",
      z.object({
        filePath: z.string(),
      })
    ),
    async (ctx) => {
      const accessToken = ctx.get("accessToken");
      const { filePath } = ctx.req.valid("query");
      const drive = new Drive("PUBLIC", accessToken);

      try {
        const [item, meta] = await Promise.all([
          drive.getItem(filePath),
          drive.getMeta(filePath),
        ]);
        return ctx.jsonT({ item, meta });
      } catch (err) {
        return driveErrHandler(err);
      }
    }
  )

  .get(
    "/children",
    zValidator(
      "query",
      z.object({
        dirPath: z.string(),
      })
    ),
    async (ctx) => {
      const accessToken = ctx.get("accessToken");
      const { dirPath } = ctx.req.valid("query");
      const drive = new Drive("PUBLIC", accessToken);

      try {
        const [children, meta] = await Promise.all([
          drive.getChildren(dirPath),
          drive.getMeta(dirPath),
        ]);
        return ctx.jsonT({ children, meta });
      } catch (err) {
        return driveErrHandler(err);
      }
    }
  );
