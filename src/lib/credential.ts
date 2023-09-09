import { type z } from "zod";
import { type ENV } from "./constant";
import { KV } from "./kv";
import { fetchRequest } from "./request";
import { type reqValidator, type resValidator } from "./types/res_req";

export async function requestAccessToken(
  env: ENV
): Promise<z.infer<(typeof resValidator)["token"]>> {
  console.log("Requesting access token...");
  const tokenEndpoint = `https://login.microsoftonline.com/${env.ASSETS_TENANT_ID}/oauth2/v2.0/token`;

  const body: z.infer<(typeof reqValidator)["token"]> = {
    client_id: env.ASSETS_CLIENT_ID,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
    client_secret: env.ASSETS_CLIENT_SECRET,
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

export async function getOrRefreshCredential(env: ENV): Promise<string> {
  const accessTokenKV = new KV(env.SHAREPOINT_ACCESS_TOKEN, "accessToken");

  let accessToken = await accessTokenKV.get();

  if (accessToken == null) {
    console.log(`accessToken is null; fetching new one`);
    const res = await requestAccessToken(env);
    if (res == null) {
      throw new Error("Failed to get access token");
    }

    accessToken = res.access_token;
    await accessTokenKV.put(accessToken);
  }

  return accessToken;
}
