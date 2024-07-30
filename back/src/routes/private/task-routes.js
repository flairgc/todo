
export async function taskRoutes(fastify) {
  // create task
  fastify.post('/', async (request, reply) => {
    try {

      const { title, description } = request.body;

      const { rows } = await fastify.pg.query(
        'insert into todo.tasks (title, description, user_id) values ($1, $2, $3) returning id, title, description, user_id',
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
        `update todo.tasks set title = $2, description = $3, updated_at = now()
         where id = $1 returning id, title, description, user_id`,
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
        'select * from todo.tasks where user_id = $1',
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
        'delete from todo.tasks where id = $1',
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
