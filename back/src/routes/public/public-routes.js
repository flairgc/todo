import { authRoutes } from './auth.js';


export async function publicRoutes(fastify, options) {

  fastify.register(authRoutes, { prefix: '/auth' })

  fastify.get('/public', async (request, reply) => {
    return { message: 'This is a public route' }
  })
}
