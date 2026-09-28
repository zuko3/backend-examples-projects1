export class UserService {
  constructor(userClient) {
    this.userClient = userClient;
  }

  async getUser(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await this.userClient.getUser(userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }
}