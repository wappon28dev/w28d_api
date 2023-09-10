import { type ENV } from "./constant";

type AnalyticsEvent = {
  name: string;
  params: Record<string, string>;
};

type AnalyticsEventAssets = {
  name: "assets";
  params: {
    key: string;
    operation: "item" | "children";
    fileOrDirPath: string;
  };
};

export async function sendAnalytics(
  env: ENV,
  clientId: string,
  events: AnalyticsEvent[]
): Promise<void> {
  const baseUrl = `https://www.google-analytics.com/${
    env.IS_PROD ? "" : "debug/"
  }mp/collect`;

  await fetch(
    `${baseUrl}?measurement_id=${env.ANALYTICS_MEASUREMENT_ID}&api_secret=${env.ANALYTICS_API_SECRET}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id: clientId,
        events,
      }),
    }
  );
}

export async function sendAnalyticsEventAssets(
  env: ENV,
  referer: string | undefined,
  assetsEvent: AnalyticsEventAssets
): Promise<void> {
  await sendAnalytics(env, referer ?? "unknown", [assetsEvent]);
}
