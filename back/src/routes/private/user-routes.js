export async function userRoutes(fastify) {
  fastify.get('/', async (request) => {
    return { message: `This is a user route for ${request.user} and token ${request.token}` }
  })

  fastify.get('/:id', function (req, reply) {
    fastify.pg.query(
      'SELECT id, name FROM todo.users WHERE id=$1', [req.params.id],
      function onResult(error, result) {
        if (error) {
          return reply.code(500).send({ DB_ERROR: error })
        } else {
          return reply.send(result.rows)
        }
      }
    )
  })

}
