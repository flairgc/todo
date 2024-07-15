import fastifyPlugin from 'fastify-plugin'
import fastifyPostgres from '@fastify/postgres'

/**
 * @param {FastifyInstance} fastify
 * @param {Object} options
 */
async function dbConnector (fastify, options) {
  console.log('DB_CONNECTION_STRING', process.env.DB_CONNECTION_STRING);
  fastify.register(fastifyPostgres, {
    connectionString: process.env.DB_CONNECTION_STRING
  })
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
export default fastifyPlugin(dbConnector)
