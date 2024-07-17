import 'dotenv/config'
import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'

import dbConnector from './db-connector.js'
import routes from './routes/routes.js'


/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
    logger: true
})

fastify.register(fastifyCookie)

fastify.register(dbConnector)
fastify.register(routes)

fastify.listen({ port: Number(process.env.APP_PORT) }, function (err) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})
