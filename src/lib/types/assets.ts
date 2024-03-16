import { z } from "zod";

export const zAssetManifests = z.record(
  z.string(), // key
  z.object({
    driveId: z.string(),
    allowedHosts: z.array(z.string().url()),
    accessKey: z.string(),
    basePath: z.string(),
    baseUrl: z.string().url(),
    allowedMethods: z.array(z.string()),
  }),
);

export type AssetManifests = z.infer<typeof zAssetManifests>;
