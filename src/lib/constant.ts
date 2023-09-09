import { Hono } from "hono";
import { type z } from "zod";

export type ENV = {
  ASSETS_CENTER_ACCESS_DATA: KVNamespace;
  ALLOW_HOST_LIST: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  TENANT_ID: string;
  DRIVE_ID_PUBLIC: string;
  DRIVE_ID_PROTECTED: string;
};

export type Variables = {
  accessToken: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToZod<T extends Record<string, any>> = {
  [K in keyof T]-?: z.ZodType<T[K]>;
};

export type ValueOf<T> = T[keyof T];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createHono() {
  return new Hono<{ Bindings: ENV; Variables: Variables }>();
}

export const getApiEndpoint = (path: string): string =>
  `https://graph.microsoft.com/v1.0${path}`;
