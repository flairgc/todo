import Fastify from 'fastify'
import 'dotenv/config'

import dbConnector from './db-connector.js'
import routes from './routes.js'


console.log(process.env)

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
    logger: true
})
fastify.register(dbConnector)
fastify.register(routes)

fastify.listen({ port: 3000 }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    fastify.log.info(err)
    // Server is now listening on ${address}
})
