import 'dotenv/config'
import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'

import dbConnector from './db-connector.js'
import routes from './routes/routes.js'
import { config } from './utils/config.js';


/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
    logger: true
});

console.log(`Current version Node.js: ${process.version}`);

fastify.decorate('conf', config);

fastify.register(fastifyCookie);

fastify.register(dbConnector);
fastify.register(routes);

fastify.listen({ port: config.port }, function (err) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
});
