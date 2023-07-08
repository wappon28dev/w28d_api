import { type z } from "zod";
import { type ENV } from "./constant";
import { fetchRequest } from "./request";
import { type reqValidator, type resValidator } from "./types/res_req";

export async function requestAccessToken(
  env: ENV
): Promise<z.infer<(typeof resValidator)["token"]>> {
  const tokenEndpoint = `https://login.microsoftonline.com/${env.TENANT_ID}/oauth2/v2.0/token`;

  const body: z.infer<(typeof reqValidator)["token"]> = {
    client_id: env.CLIENT_ID,
    scope: "offline_access user.read Sites.ReadWrite.All",
    grant_type: "client_credentials",
    client_secret: env.CLIENT_SECRET,
  };

  return await fetchRequest(
    [
      tokenEndpoint,
      {
        method: "POST",
        body: new URLSearchParams(body),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    ],
    "Token request failed"
  );
}
