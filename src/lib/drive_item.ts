import { type z } from "zod";
import { ResponseNotOkError, getApiEndpoint, type valueOf } from "./constant";
import { fetchRequest } from "./request";
import { type resValidator } from "./types/res_req";

const DRIVE_ID = {
  PUBLIC: "b!QRbp9KMYTEiPf6Lw5ClXeKTxpF3W6gFNmzyqrgNi3b3lP-XJJdw6TYnw6uhG4aYW",
  PROTECTED:
    "b!QRbp9KMYTEiPf6Lw5ClXeKTxpF3W6gFNmzyqrgNi3b3PaeLCjd8rQZo0XY_IkXpN",
};

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
  private readonly id: valueOf<typeof DRIVE_ID>;

  constructor(
    public key: keyof typeof DRIVE_ID,
    private readonly accessToken: string
  ) {
    this.id = DRIVE_ID[key];
  }

  public async getChildren(
    filePath: string
  ): Promise<z.infer<(typeof resValidator)["driveChildren"]>> {
    const endpoint = getApiEndpoint(
      `/drives/${this.id}/root:/${filePath}:/children`
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

  public async getItem(
    filePath: string
  ): Promise<z.infer<(typeof resValidator)["driveItem"]>> {
    const endpoint = getApiEndpoint(`/drives/${this.id}/root:/${filePath}:/`);

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
}
