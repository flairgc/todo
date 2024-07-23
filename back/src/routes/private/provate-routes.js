import { userRoutes } from './user-routes.js';

async function privateRoutes(fastify, options) {
  fastify.register(userRoutes, { prefix: '/user' })
}

export async function privateContext (fastify) {

  fastify.addHook('onRequest',   async function authenticate(request, reply) {
    const { access } = request.cookies;

    try {
      const transaction = await fastify.pg.query(
        'select 1 from todo.sessions where access_token=$1 and now() < expire_access_at', [access],
      );

      if (transaction.rows.length === 0) {
        reply.code(401).send({ error: 'Unauthorized' })
      }
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.register(privateRoutes);
}
