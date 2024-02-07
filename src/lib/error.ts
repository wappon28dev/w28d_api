/* eslint-disable max-classes-per-file */

import { GraphError } from "@microsoft/microsoft-graph-client";
import { HTTPException } from "hono/http-exception";

export class NetworkError extends Error {
  constructor(public reason: string) {
    super(JSON.stringify({ message: "Network Error", reason }));
  }
}

export class ResponseNotOkError extends Error {
  constructor(
    message: string,
    public reason: string,
    public status: number
  ) {
    super(JSON.stringify({ message, reason, status }));
  }
}

export function graphErrorHandler(err: unknown): never {
  if (!(err instanceof Error)) {
    throw new HTTPException(500, { message: "Unknown error" });
  }
  if (err instanceof GraphError) {
    throw new HTTPException(err.statusCode, { message: err.message });
  } else {
    throw new HTTPException(500, { message: err.message });
  }
}
