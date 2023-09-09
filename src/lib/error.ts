/* eslint-disable max-classes-per-file */
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
