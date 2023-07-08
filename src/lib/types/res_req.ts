import { z } from "zod";

export const reqValidator = {
  token: z.object({
    client_id: z.string(),
    scope: z.literal("https://graph.microsoft.com/.default"),
    grant_type: z.literal("client_credentials"),
    client_secret: z.string(),
  }),
};

export const resValidator = {
  token: z.object({
    token_type: z.literal("Bearer"),
    scope: z.string(),
    expires_in: z.number(),
    ext_expires_in: z.number(),
    access_token: z.string(),
    refresh_token: z.string(),
  }),
  driveChildren: z.object({
    "@odata.context": z.string(),
    value: z.array(
      z.object({
        "@microsoft.graph.downloadUrl": z.string(),
        createdDateTime: z.string(),
        eTag: z.string(),
        id: z.string(),
        lastModifiedDateTime: z.string(),
        name: z.string(),
        webUrl: z.string(),
        cTag: z.string(),
        size: z.number(),
        createdBy: z.object({
          user: z.object({
            email: z.string(),
            id: z.string(),
            displayName: z.string(),
          }),
        }),
        lastModifiedBy: z.object({
          user: z.object({
            email: z.string(),
            id: z.string(),
            displayName: z.string(),
          }),
        }),
        parentReference: z.object({
          driveType: z.string(),
          driveId: z.string(),
          id: z.string(),
          path: z.string(),
          siteId: z.string(),
        }),
        file: z.object({
          mimeType: z.string(),
          hashes: z.object({ quickXorHash: z.string() }),
        }),
        fileSystemInfo: z.object({
          createdDateTime: z.string(),
          lastModifiedDateTime: z.string(),
        }),
        shared: z.object({ scope: z.string() }),
      })
    ),
  }),
  driveItem: z.object({
    "@odata.context": z.string(),
    "@microsoft.graph.downloadUrl": z.string(),
    createdDateTime: z.string(),
    eTag: z.string(),
    id: z.string(),
    lastModifiedDateTime: z.string(),
    name: z.string(),
    webUrl: z.string(),
    cTag: z.string(),
    size: z.number(),
    createdBy: z.object({
      user: z.object({
        email: z.string(),
        id: z.string(),
        displayName: z.string(),
      }),
    }),
    lastModifiedBy: z.object({
      user: z.object({
        email: z.string(),
        id: z.string(),
        displayName: z.string(),
      }),
    }),
    parentReference: z.object({
      driveType: z.string(),
      driveId: z.string(),
      id: z.string(),
      path: z.string(),
      siteId: z.string(),
    }),
    file: z.object({
      mimeType: z.string(),
      hashes: z.object({ quickXorHash: z.string() }),
    }),
    fileSystemInfo: z.object({
      createdDateTime: z.string(),
      lastModifiedDateTime: z.string(),
    }),
    shared: z.object({ scope: z.string() }),
  }),
};
