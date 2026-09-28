import Fastify from "fastify";
import { env } from "./config/env.js";
import { HttpClient } from "./http/http-client.js";

import { UserClient } from "./clients/user.client.js";
import { UserService } from "./services/user.service.js";
import { createUserController } from "./controllers/user.controller.js";
import { userRoutes } from "./routes/user.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });
  // Infrastructure
  const httpClient = new HttpClient({
    timeout: env.userApiTimeout,
  });

  // External API client
  const userClient = new UserClient(httpClient, env.userApiUrl);

  // Business service
  const userService = new UserService(userClient);

  // Controller
  const userController = createUserController(userService);

  // Routes
  app.register(userRoutes, {
    userController,
  });

  return app;
}