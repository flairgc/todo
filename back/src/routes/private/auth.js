export async function authenticate(request, reply) {
  const token = request.headers['authorization']
  console.log('token', token);
  if (!token) {
    reply.code(401).send({ error: 'Unauthorized' })
    return;
  }



  try {
    request.user = 'user1';
    request.token = token;
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' })
  }
}
