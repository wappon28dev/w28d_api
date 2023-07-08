import { z } from "zod";

export const kvEntries = {
  accessToken: {
    key: "accessToken",
    ttl: 3600 - 60, // margin 60s
    value: z.string(),
  },
};
