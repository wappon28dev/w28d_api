import { type Client } from "@microsoft/microsoft-graph-client";
import { assetManifestsScheme, type AssetManifests } from "./types/assets";

export type ENV = {
  SHAREPOINT_ACCESS_TOKEN: KVNamespace;
  ASSETS_CLIENT_ID: string;
  ASSETS_CLIENT_SECRET: string;
  ASSETS_TENANT_ID: string;
  ASSETS_DOWNLOAD_MANIFESTS: string;
  ASSETS_UPLOAD_MANIFESTS: string;
  ANALYTICS_MEASUREMENT_ID: string;
  ANALYTICS_API_SECRET: string;
  IS_PROD: boolean;
};

export type Variables = {
  graphClient: Client;
  assetManifest: AssetManifests[string];
  mode: {
    exec: "download" | "upload";
    key: keyof AssetManifests;
  };
};

export type HonoType = { Bindings: ENV; Variables: Variables };

export type ValueOf<T> = T[keyof T];

export const getApiEndpoint = (path: string[]): string =>
  new URL(`https://graph.microsoft.com/v1.0/${path.join("/")}`).toString();

export const getAssetsManifests = (
  env: ENV
): { download: AssetManifests; upload: AssetManifests } => {
  const download = assetManifestsScheme.parse(
    JSON.parse(env.ASSETS_DOWNLOAD_MANIFESTS)
  );
  const upload = assetManifestsScheme.parse(
    JSON.parse(env.ASSETS_UPLOAD_MANIFESTS)
  );

  return { download, upload };
};
