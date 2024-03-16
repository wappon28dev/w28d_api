import { type z } from "zod";
import {
  LargeFileUploadTask,
  type Client,
  type LargeFileUploadSession,
} from "@microsoft/microsoft-graph-client";
import { type ListItem, type resValidator } from "lib/types/res_req";
import { type AssetManifests } from "lib/types/assets";
import { HTTPException } from "hono/http-exception";
import { graphErrorHandler } from "./error";

export class Drive {
  constructor(
    private readonly client: Client,
    private readonly manifest: AssetManifests[string],
  ) {}

  static joinPath(path: string[], needTrailSlash = false): string {
    const joinedPath = path
      .filter((p) => p !== "")
      .join("/")
      // 複数の `/` を 1 つにまとめる
      .replace(/\/+/g, "/")
      // 末尾の `/` を削除する
      .replace(/\/$/, "");

    return needTrailSlash ? `${joinedPath}/` : joinedPath;
  }

  public async getItem(
    fileOrDirPath: string,
  ): Promise<z.infer<(typeof resValidator)["listItem"]>> {
    const path = [
      "drives",
      this.manifest.driveId,
      "root:",
      `${Drive.joinPath([this.manifest.basePath, fileOrDirPath])}:`,
      "listItem?expand=driveItem",
    ].join("/");

    return await this.client.api(path).get().catch(graphErrorHandler);
  }

  public async getFileDownloadUrl(filePath: string): Promise<string> {
    const path = [
      "drives",
      this.manifest.driveId,
      "root:",
      `${Drive.joinPath([this.manifest.basePath, filePath])}:`,
      "?$select=content.downloadUrl",
    ].join("/");

    const res: {
      "@microsoft.graph.downloadUrl": string;
    } = await this.client.api(path).get().catch(graphErrorHandler);
    const downloadUrl = res["@microsoft.graph.downloadUrl"];

    if (downloadUrl == null) {
      throw new HTTPException(400, {
        message: "The file is not downloadable; It may be a folder.",
      });
    }
    return downloadUrl;
  }

  public async getChildren(
    dirPath: string,
  ): Promise<z.infer<(typeof resValidator)["driveChildren"]>> {
    const path = [
      "drives",
      this.manifest.driveId,
      "root:",
      `${Drive.joinPath([this.manifest.basePath, dirPath])}:`,
      "children",
    ].join("/");

    return await this.client.api(path).get().catch(graphErrorHandler);
  }

  public async getChildrenFlat(): Promise<ListItem> {
    const query = {
      // `content.downloadUrl` means `@microsoft.graph.downloadUrl` (undocumented!)
      // ref: https://stackoverflow.com/questions/45502275
      $expand: "driveItem($select=name,size,content.downloadUrl,webUrl)",
      $select: "lastModifiedDateTime,driveItem",
      $filter: "contentType/name eq 'ドキュメント'",
    };

    const path = [
      "drives",
      this.manifest.driveId,
      "list",
      `items?${new URLSearchParams(query).toString()}`,
    ].join("/");

    return await this.client.api(path).get().catch(graphErrorHandler);
  }

  public async createUploadSession(
    filePath: string,
  ): Promise<LargeFileUploadSession> {
    const url = [
      "drives",
      this.manifest.driveId,
      "root:",
      `${Drive.joinPath([this.manifest.basePath, filePath])}:`,
      "createUploadSession",
    ].join("/");

    return await LargeFileUploadTask.createUploadSession(
      this.client,
      url,
      {},
    ).catch(graphErrorHandler);
  }
}
