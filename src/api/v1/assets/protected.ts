import { zValidator } from "@hono/zod-validator";
import { createHono } from "lib/constant";
import { Drive, driveErrHandler } from "lib/drive_item";
import { z } from "zod";

export const protectedRouter = createHono().get(
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
    const drive = new Drive("PROTECTED", accessToken);

    try {
      const res = await drive.getItem(filePath);
      return ctx.jsonT(res);
    } catch (err) {
      return driveErrHandler(err);
    }
  }
);
