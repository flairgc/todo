import fastifyPlugin from 'fastify-plugin';


/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify, options) {
  // const collection = fastify.mongo.db.collection('test_collection')


  fastify.get('/', async (request, reply) => {
    return { hello: 'world' }
  })

  // fastify.get('/user/:id', function (req, reply) {
  //   console.log('user', req.params.id);
  //   fastify.pg.query(
  //     'select id, name from test WHERE id=$1', [req.params.id],
  //     function onResult (err, result) {
  //       console.log('onResult err', err);
  //       console.log('onResult result', result);
  //       reply.send(err || result)
  //     }
  //   )
  // })

  fastify.get('/user/:id', async (req, reply) => {
    const client = await fastify.pg.connect()
    try {
      const { rows } = await client.query(
        'SELECT id, name FROM test WHERE id=$1', [req.params.id],
      )
      console.log('rows', rows);
      // Note: avoid doing expensive computation here, this will block releasing the client
      return rows
    } finally {
      // Release the client immediately after query resolves, or upon error
      client.release()
    }
  })

  // fastify.get('/animals', async (request, reply) => {
  //   const result = await collection.find().toArray()
  //   if (result.length === 0) {
  //     throw new Error('No documents found')
  //   }
  //   return result
  // })
  //
  // fastify.get('/animals/:animal', async (request, reply) => {
  //   const result = await collection.findOne({ animal: request.params.animal })
  //   if (!result) {
  //     throw new Error('Invalid value')
  //   }
  //   return result
  // })
  //
  // const animalBodyJsonSchema = {
  //   type: 'object',
  //   required: ['animal'],
  //   properties: {
  //     animal: { type: 'string' },
  //   },
  // }
  //
  // const schema = {
  //   body: animalBodyJsonSchema,
  // }
  //
  // fastify.post('/animals', { schema }, async (request, reply) => {
  //   // we can use the `request.body` object to get the data sent by the client
  //   const result = await collection.insertOne({ animal: request.body.animal })
  //   return result
  // })
}

export default fastifyPlugin(routes)

