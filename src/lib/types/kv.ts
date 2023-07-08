import { z } from "zod";

export const kvEntries = {
  accessToken: {
    key: "accessToken",
    ttl: 60,
    value: z.string(),
  },
};
