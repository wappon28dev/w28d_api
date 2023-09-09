import { type z } from "zod";
import { getApiEndpoint } from "./constant";
import { fetchRequest } from "./request";
import { type resValidator } from "./types/res_req";
import { ResponseNotOkError } from "./error";
import { type AssetManifests } from "./types/assets";

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

  throw new Error(`Unknown error${String(err)}`);
}

export class Drive {
  constructor(
    private readonly accessToken: string,
    private readonly manifest: AssetManifests[string]
  ) {}

  public async getItem(
    fileOrDirPath: string
  ): Promise<z.infer<(typeof resValidator)["listItem"]>> {
    const distFileOrDirPath = [
      ...this.manifest.distPath,
      ...fileOrDirPath.split("/"),
    ].join("/");

    const endpoint = getApiEndpoint([
      "drives",
      this.manifest.driveId,
      "root:",
      `${distFileOrDirPath}:`,
      "listItem?expand=driveItem",
    ]);

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
    const distDirPath = [...this.manifest.distPath, ...dirPath.split("/")].join(
      "/"
    );

    const endpoint = getApiEndpoint([
      "drives",
      this.manifest.driveId,
      "root:",
      `${distDirPath}:`,
      "children",
    ]);

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
