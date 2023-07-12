import { z } from "zod";

export const assetScope = z.enum(["public", "protected"]);
