import { z } from "zod";

export const zAssetManifests = z.record(
  z.string(), // key
  z.object({
    driveId: z.string(),
    allowedHosts: z.array(z.string()),
    accessKey: z.string(),
    basePath: z.string(),
    allowedMethods: z.array(z.string()),
  })
);

export type AssetManifests = z.infer<typeof zAssetManifests>;
