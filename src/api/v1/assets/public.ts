import { createHono } from "lib/constant";
import { Drive, driveErrHandler } from "lib/drive_item";
import { resValidator } from "lib/types/res_req";

export const publicRouter = createHono()
  .get("/:filepath{.+\\..+$}", async (ctx) => {
    const accessToken = ctx.get("accessToken");
    const path = ctx.req.param("filepath");

    const drive = new Drive("PUBLIC", accessToken);

    try {
      const res = await drive.getItem(path);
      return ctx.jsonT(resValidator.driveItem.parse(res));
    } catch (err) {
      return driveErrHandler(err);
    }
  })

  .get("/:filepath{.+}", async (ctx) => {
    const accessToken = ctx.get("accessToken");
    const path = ctx.req.param("filepath");

    const drive = new Drive("PUBLIC", accessToken);

    try {
      const res = await drive.getChildren(path);
      return ctx.jsonT(res);
    } catch (err) {
      return driveErrHandler(err);
    }
  });
