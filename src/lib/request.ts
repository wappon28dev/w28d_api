import { HTTPException } from "hono/http-exception";

type FetchArgs = Parameters<typeof fetch>;

export async function fetchRequest<T>(
  fetchArg: FetchArgs,
  errMessage: string,
): Promise<T> | never {
  const res = await fetch(...fetchArg).catch(() => {
    throw new HTTPException(500, {
      message: "Network error occurred in internal request",
    });
  });

  if (!res.ok) {
    console.error(await res.json());
    throw new HTTPException(500, { message: errMessage });
  }

  return (await res.json()) as T;
}
