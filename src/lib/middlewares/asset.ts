import { Client } from "@microsoft/microsoft-graph-client";
import { type MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { bearerAuth } from "hono/bearer-auth";

import {
  getAssetsManifests,
  type Variables,
  type HonoType,
} from "lib/constant";
import { getOrRefreshCredential } from "lib/credential";

export const injectReqMode: MiddlewareHandler<HonoType, "/:key/*"> = async (
  ctx,
  next
) => {
  console.log("inject key mode");
  const key = ctx.req.param("key");

  if (key == null) {
    throw new Error(
      "`key` is missing! Maybe you forget that the path is in `/:key/*`"
    );
  }

  let exec: Variables["mode"]["exec"];

  switch (ctx.req.method) {
    case "GET":
      exec = "download";
      break;
    case "POST":
      exec = "upload";
      break;
    default:
      throw new HTTPException(405);
  }

  ctx.set("mode", { exec, key });
  await next();
};

export const injectGraphClient: MiddlewareHandler<HonoType> = async (
  ctx,
  next
) => {
  console.log("assets middleware");
  const graphClient = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => getOrRefreshCredential(ctx.env),
    },
  });
  ctx.set("graphClient", graphClient);

  await next();
};

export const authGuard: MiddlewareHandler<HonoType> = async (ctx, next) => {
  console.log("secure guard");
  const referer = ctx.req.header("referer");
  const { exec, key } = ctx.var.mode;

  const manifest = getAssetsManifests(ctx.env)[exec][key];

  if (manifest == null) {
    return await ctx.notFound();
  }

  const { allowedHosts, accessKey } = manifest;

  if (referer == null) {
    throw new HTTPException(400, { message: "referer header is required" });
  }

  if (!allowedHosts.some((host) => referer.startsWith(host))) {
    throw new HTTPException(403);
  }

  ctx.set("assetManifest", manifest);

  return await bearerAuth({ token: accessKey })(ctx, next);
};

export const configureCors: MiddlewareHandler<HonoType> = async (ctx, next) => {
  const { exec } = ctx.var.mode;
  const { allowedHosts } = ctx.var.assetManifest;

  const method: Record<typeof exec, string> = {
    download: "GET",
    upload: "POST",
  };

  return await cors({
    origin: allowedHosts,
    exposeHeaders: [method[exec]],
  })(ctx, next);
};
