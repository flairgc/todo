export async function authRoutes(fastify, options) {
  fastify.get('/signin', async (request, reply) => {

    console.log('request.cookies', request.cookies);

    reply
      .setCookie('foo', 'foo', {
        // domain: 'example.com',
        path: '/',
        httpOnly: true,
      })
      .send({ hello: 'world2' })
  })
}
