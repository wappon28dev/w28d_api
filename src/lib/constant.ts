import { Hono } from "hono";
import { type z } from "zod";

export type ENV = {
  ASSETS_CENTER_ACCESS_DATA: KVNamespace;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  TENANT_ID: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type toZod<T extends Record<string, any>> = {
  [K in keyof T]-?: z.ZodType<T[K]>;
};

export type valueOf<T> = T[keyof T];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createHono() {
  return new Hono<{ Bindings: ENV }>();
}

export const getApiEndpoint = (path: string): string =>
  "https://graph.microsoft.com/v1.0" + path;

export class NetworkError extends Error {
  constructor(reason: string) {
    super(JSON.stringify({ message: "Network Error", reason }));
  }
}

export class ResponseNotOkError extends Error {
  constructor(message: string, reason: string) {
    super(JSON.stringify({ message, reason }));
  }
}

export class InvalidJwtError extends Error {
  constructor(
    reason: string,
    public status?: number
  ) {
    super(
      JSON.stringify({
        message: "Invalid JWT Error",
        reason,
      })
    );
  }
}

export class StoreError extends Error {
  constructor(
    reason: string,
    public status?: number
  ) {
    super(JSON.stringify({ message: "Store Error", reason }));
  }
}
