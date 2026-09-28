export class UserClient {
  constructor(httpClient, baseUrl) {
    this.httpClient = httpClient;
    this.baseUrl = baseUrl;
  }

  async getUser(userId) {
    return this.httpClient.get(
      `${this.baseUrl}/users/${userId}`
    );
  }
}