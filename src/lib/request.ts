import { NetworkError, ResponseNotOkError } from "./error";

type FetchArgs = Parameters<typeof fetch>;

export async function fetchRequest<T>(
  fetchArg: FetchArgs,
  errMessage: string
): Promise<T> | never {
  const res = await fetch(...fetchArg).catch((err) => {
    throw new NetworkError(err);
  });

  if (!res.ok) {
    console.error(res);
    throw new ResponseNotOkError(errMessage, await res.json(), res.status);
  }

  return (await res.json()) as T;
}
