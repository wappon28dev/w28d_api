import { z } from "zod";

export const assetManifestsScheme = z.record(
  z.string(), // key
  z.object({
    driveId: z.string(),
    allowedHosts: z.array(z.string()),
    accessKey: z.string(),
    distPath: z.array(z.string()),
  })
);

export type AssetManifests = z.infer<typeof assetManifestsScheme>;
