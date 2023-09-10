import { Hono } from "hono";
import { type z } from "zod";
import { assetManifestsScheme, type AssetManifests } from "./types/assets";

export type ENV = {
  SHAREPOINT_ACCESS_TOKEN: KVNamespace;
  ASSETS_CLIENT_ID: string;
  ASSETS_CLIENT_SECRET: string;
  ASSETS_TENANT_ID: string;
  ASSETS_MANIFESTS: string;
  ANALYTICS_MEASUREMENT_ID: string;
  ANALYTICS_API_SECRET: string;
  IS_PROD: boolean;
};

export type Variables = {
  accessToken: string;
  assetManifest: AssetManifests[string];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToZod<T extends Record<string, any>> = {
  [K in keyof T]-?: z.ZodType<T[K]>;
};

export type ValueOf<T> = T[keyof T];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createHono() {
  return new Hono<{ Bindings: ENV; Variables: Variables }>();
}

export const getApiEndpoint = (path: string[]): string =>
  new URL(`https://graph.microsoft.com/v1.0/${path.join("/")}`).toString();

export const getAssetsManifests = (env: ENV): AssetManifests =>
  assetManifestsScheme.parse(JSON.parse(env.ASSETS_MANIFESTS));
