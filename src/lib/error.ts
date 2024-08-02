import { GraphError } from "@microsoft/microsoft-graph-client";
import { HTTPException } from "hono/http-exception";

export function graphErrorHandler(err: unknown): never {
  if (!(err instanceof Error)) {
    throw new HTTPException(500, { message: "Unknown error" });
  }
  if (err instanceof GraphError) {
    throw new HTTPException(err.statusCode, {
      message: `Graph API Error: ${err.message}`,
    });
  } else {
    throw new HTTPException(500, { message: err.message });
  }
}
