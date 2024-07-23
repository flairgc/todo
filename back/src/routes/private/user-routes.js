export async function userRoutes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    return { message: `This is a user route for ${request.user} and token ${request.token}` }
  })

  fastify.get('/:id', function (req, reply) {
    console.log('get client', req.params.id);
    fastify.pg.query(
      'SELECT id, name FROM todo.users WHERE id=$1', [req.params.id],
      function onResult(error, result) {
        console.log('error', error);
        if (error) {
          reply.code(500).send({ DB_ERROR: error })
        } else {
          console.log('result', result.rows);
          reply.send(result.rows)
        }
      }
    )
  })

}
