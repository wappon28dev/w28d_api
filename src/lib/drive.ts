import { type z } from "zod";
import {
  LargeFileUploadTask,
  type Client,
  type LargeFileUploadSession,
} from "@microsoft/microsoft-graph-client";
import { type resValidator } from "lib/types/res_req";
import { type AssetManifests } from "lib/types/assets";
import { graphErrorHandler } from "./error";

export class Drive {
  constructor(
    private readonly client: Client,
    private readonly manifest: AssetManifests[string]
  ) {}

  public async getItem(
    fileOrDirPath: string
  ): Promise<z.infer<(typeof resValidator)["listItem"]>> {
    const path = [
      "drives",
      this.manifest.driveId,
      "root:",
      this.manifest.distPath,
      `${fileOrDirPath}:`,
      "listItem?expand=driveItem",
    ].join("/");

    return await this.client.api(path).get().catch(graphErrorHandler);
  }

  public async getChildren(
    dirPath: string
  ): Promise<z.infer<(typeof resValidator)["driveChildren"]>> {
    const path = [
      "drives",
      this.manifest.driveId,
      "root:",
      this.manifest.distPath,
      `${dirPath}:`,
      "children",
    ].join("/");

    return await this.client.api(path).get().catch(graphErrorHandler);
  }

  public async createUploadSession(
    filePath: string
  ): Promise<LargeFileUploadSession> {
    const url = [
      "drives",
      this.manifest.driveId,
      "root:",
      this.manifest.distPath.join("/"),
      `${filePath}:`,
      "createUploadSession",
    ].join("/");

    return await LargeFileUploadTask.createUploadSession(
      this.client,
      url,
      {}
    ).catch(graphErrorHandler);
  }
}
