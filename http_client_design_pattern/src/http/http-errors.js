export class HttpClientError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "HttpClientError";
    this.statusCode = options.statusCode || 500;
    this.code = options.code || "HTTP_CLIENT_ERROR";
    this.cause = options.cause;
  }
}