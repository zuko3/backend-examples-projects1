export function createUserController(userService) {
  return {
    getUser: async (request, reply) => {
      const { id } = request.params;

      const user = await userService.getUser(id);

      return reply.send(user);
    }
  };
}