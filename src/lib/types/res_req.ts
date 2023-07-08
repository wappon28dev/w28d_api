import { z } from "zod";

export const reqValidator = {
  token: z.object({
    client_id: z.string(),
    scope: z.literal("offline_access user.read Sites.ReadWrite.All"),
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
  userInfo: z.object({
    "@odata.context": z.string(),
    businessPhones: z.array(z.string()),
    displayName: z.string(),
    givenName: z.string().nullable(),
    jobTitle: z.string().nullable(),
    mail: z.string().email(),
    mobilePhone: z.string().nullable(),
    officeLocation: z.string().nullable(),
    preferredLanguage: z.string().nullable(),
    surname: z.string().nullable(),
    userPrincipalName: z.string().email(),
    id: z.string().uuid(),
  }),
  photoMeta: z.object({
    "@odata.mediaContentType": z.enum(["image/jpeg", "image/png"]),
    id: z.literal("default"),
    height: z.number(),
    width: z.number(),
  }),
  getProjectList: z.object({
    "@odata.context": z.string(),
    value: z.array(
      z.object({
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
        fileSystemInfo: z.object({
          createdDateTime: z.string(),
          lastModifiedDateTime: z.string(),
        }),
        folder: z.object({ childCount: z.number() }),
        shared: z.object({ scope: z.string() }),
      })
    ),
  }),
  getProjectMeta: z.object({
    name: z.string(),
    description: z.string(),
    version: z.string(),
    thumbnail: z.string(),
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
