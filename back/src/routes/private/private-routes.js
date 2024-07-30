import { userRoutes } from './user-routes.js';
import { taskRoutes } from './task-routes.js';

async function privateRoutes(fastify) {
  fastify.register(userRoutes, { prefix: '/user' });
  fastify.register(taskRoutes, { prefix: '/tasks' });
}

export async function privateContext (fastify) {

  fastify.addHook('onRequest', async function authenticate(request, reply) {
    const { access } = request.cookies;

    try {
      const transaction = await fastify.pg.query(
        'select user_id from todo.sessions where access_token=$1 and now() < expire_access_at', [access],
      );

      if (transaction.rows.length !== 1) {
        return reply.code(401).send({ error: 'Unauthorized' })
      }

      request.user_id = transaction.rows[0].user_id;
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.register(privateRoutes);
}