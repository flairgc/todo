import { userRoutes } from './user-routes.js';
import { authenticate } from '../hooks/auth.js';

async function privateRoutes(fastify, options) {
  fastify.register(userRoutes, { prefix: '/user' })
}

export async function privateContext (fastify, options) {
  fastify.addHook('onRequest', authenticate)
  fastify.register(privateRoutes)
}
