import Fastify from 'fastify'
import 'dotenv/config'

import dbConnector from './db-connector.js'
import routes from './routes.js'


/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
    logger: true
})
fastify.register(dbConnector)
fastify.register(routes)

fastify.listen({ port: Number(process.env.APP_PORT) }, function (err) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})
