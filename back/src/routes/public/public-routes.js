import { authRoutes } from "./auth-routes.js";

export async function publicRoutes(fastify) {
  fastify.register(authRoutes, { prefix: "/auth" });

  fastify.get("/hello", async () => {
    return { message: "World!" };
  });
}
