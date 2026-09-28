import axios from "axios";
import { HttpClientError } from "./http-errors.js";

export class HttpClient {
  constructor(options = {}) {
    this.client = axios.create({
      timeout: options.timeout || 5000,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  async get(url, options = {}) {
    return this.request({
      method: "GET",
      url,
      ...options
    });
  }

  async post(url, data, options = {}) {
    return this.request({
      method: "POST",
      url,
      data,
      ...options
    });
  }

  async request(config) {
    try {
      const response = await this.client.request(config);

      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  normalizeError(error) {
    if (error.code === "ECONNABORTED") {
      return new HttpClientError(
        "External service timed out",
        {
          code: "TIMEOUT",
          statusCode: 504,
          cause: error
        }
      );
    }

    if (error.response) {
      return new HttpClientError(
        "External service returned an error",
        {
          code: "EXTERNAL_SERVICE_ERROR",
          statusCode: error.response.status,
          cause: error
        }
      );
    }

    return new HttpClientError(
      "Unable to communicate with external service",
      {
        code: "NETWORK_ERROR",
        statusCode: 503,
        cause: error
      }
    );
  }
}