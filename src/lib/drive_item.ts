import { type z } from "zod";
import { ResponseNotOkError, getApiEndpoint, type ENV, type valueOf } from "./constant";
import { fetchRequest } from "./request";
import { type resValidator } from "./types/res_req";

const getDriveId = (env: ENV): {
  public: string;
  protected: string;
} => ({
  public: env.DRIVE_ID_PUBLIC,
  protected: env.DRIVE_ID_PROTECTED
});

export function driveErrHandler(err: unknown): Response {
  if (err instanceof Error) {
    if (err instanceof ResponseNotOkError) {
      return new Response(JSON.stringify(err), {
        status: err.status,
      });
    }
    return new Response(JSON.stringify(err), {
      status: 500,
    });
  }

  throw new Error("Unknown error" + String(err));
}

export class Drive {
  private readonly id: valueOf<ReturnType<typeof getDriveId>>;

  constructor(
    public key: keyof ReturnType<typeof getDriveId>,
    private readonly accessToken: string,
    env: ENV
  ) {
    this.id = getDriveId(env)[key];
  }

  public async getItem(
    fileOrDirPath: string
  ): Promise<z.infer<(typeof resValidator)["listItem"]>> {
    const endpoint = getApiEndpoint(
      `/drives/${this.id}/root:/${fileOrDirPath}:/listItem?expand=driveItem`
    );

    return await fetchRequest(
      [
        endpoint,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      ],
      "driveItem request failed"
    );
  }

  public async getChildren(
    dirPath: string
  ): Promise<z.infer<(typeof resValidator)["driveChildren"]>> {
    const endpoint = getApiEndpoint(
      `/drives/${this.id}/root:/${dirPath}:/children`
    );

    return await fetchRequest(
      [
        endpoint,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      ],
      "driveChildren request failed"
    );
  }
}
