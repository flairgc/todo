
export async function taskRoutes(fastify) {
  // create task
  fastify.post('/', async (request, reply) => {
    try {

      const { title, description } = request.body;

      const { rows } = await fastify.pg.query(
        'INSERT INTO tasks (title, description, user_id) values ($1, $2, $3) RETURNING id, title, description, user_id',
        [title, description, request.user_id],
      );

      return reply.send({ message: 'Todo created successfully', task: rows[0] });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  // update task
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const { title, description } = request.body;

      const { rows } = await fastify.pg.query(
        `UPDATE tasks SET title = $2, description = $3, updated_at = now()
         WHERE id = $1 RETURNING id, title, description, user_id`,
        [id, title, description],
      );

      if (rows.length !== 1) {
        return reply.code(400).send({ error: 'Task not found' })
      }

      return reply.send({ message: 'Todo update successfully', task: rows[0] });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  // get tasks
  fastify.get('/', async (request, reply) => {
    try {
      const { rows } = await fastify.pg.query(
        'SELECT * FROM tasks WHERE user_id = $1',
        [request.user_id],
      )

      return reply.send(rows);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  // get tasks
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const { rows } = await fastify.pg.query(
        'DELETE FROM tasks WHERE id = $1',
        [id],
      )

      if (rows.length !== 1) {
        return reply.code(400).send({ error: 'Task not found' })
      }

      return reply.send(rows);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

}
