import { Client } from "@microsoft/microsoft-graph-client";
import { type MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { bearerAuth } from "hono/bearer-auth";
import { getAssetsManifests, type HonoType } from "lib/constant";
import { getOrRefreshCredential } from "lib/credential";

export const injectGraphClient: MiddlewareHandler<HonoType> = async (
  ctx,
  next,
) => {
  console.log("assets middleware");
  const graphClient = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => await getOrRefreshCredential(ctx.env),
    },
  });
  ctx.set("graphClient", graphClient);

  await next();
};

export const authGuard: MiddlewareHandler<HonoType, "/:key/*"> = async (
  ctx,
  next,
) => {
  console.log("secure guard");
  const referer = ctx.req.header("referer");
  const { method } = ctx.req;
  const key = ctx.req.param("key") ?? undefined;

  if (key == null) {
    throw new Error(
      "`key` is missing! Maybe you forget that the path is in `/:key/*`",
    );
  }

  const manifest = getAssetsManifests(ctx.env)[key];

  if (manifest == null) {
    return await ctx.notFound();
  }

  const { allowedHosts, accessKey, allowedMethods } = manifest;

  if (referer == null) {
    throw new HTTPException(400, { message: "referer header is required" });
  }

  if (!allowedHosts.some((host) => referer.startsWith(host))) {
    throw new HTTPException(403);
  }

  if (!allowedMethods.includes(method)) {
    throw new HTTPException(405);
  }

  ctx.set("assetManifest", manifest);

  return await bearerAuth({ token: accessKey })(ctx, next);
};

export const configureCors: MiddlewareHandler<HonoType> = async (ctx, next) => {
  const { allowedHosts, allowedMethods } = ctx.var.assetManifest;

  return await cors({
    origin: allowedHosts,
    exposeHeaders: allowedMethods,
  })(ctx, next);
};
