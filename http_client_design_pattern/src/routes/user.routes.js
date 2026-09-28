export function userRoutes(fastify, options, done) {
  const { userController } = options;

  fastify.get(
    "/users/:id",
    userController.getUser
  );

  done();
}