import crypto from 'crypto';

function generateToken() {
  // return crypto.randomBytes(64).toString('hex');
  return crypto.randomBytes(Math.ceil(12 / 2)).toString('hex').slice(0, 12);
}

export async function authRoutes(fastify) {

  fastify.post('/register', async (request, reply) => {

    // TODO need to do authentication

    const { login, password, name, passwordHint } = request.body;

    console.log('{ login, password, name, passwordHint }', { login, password, name, passwordHint });

    if (!login || !password) {
      return reply.status(400).send({ error: 'Username and password are required' });
    }

    try {
      // Генерация соли
      const salt = crypto.randomBytes(16).toString('hex');
      // Хэширование пароля с солью
      const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')

      console.log('hashedPassword', hashedPassword);

      const { rows } = await fastify.pg.query(
        'INSERT INTO todo.users (login, pass, salt, name, password_hint) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [login, hashedPassword, salt, name, passwordHint]
      )

      reply.send({ userId: rows[0].id })
    } catch (err) {
      fastify.log.error(err)
      reply.status(500).send({ error: 'Internal Server Error' })
    }
  });

  fastify.post('/login', async (request, reply) => {

    // TODO need to do authentication

    console.log('request.cookies', request.cookies);

    const { login, password } = request.body;

    console.log('{ login, password }', { login, password });

    // validation
    if ( typeof login !== 'string' || typeof password !== 'string' || !login || !password) {
      reply.code(400).send({ error: 'There is no login or password' })
      return;
    }

    // Authorization start
    try {
      const db = await fastify.pg.query(
        'SELECT id, login, pass, salt FROM users WHERE login=$1', [login],
        // function onResult (err, result) {
        //   reply.send(err || result)
        // }
      )
      console.log('db.rows', db.rows);

      if (db.rows.length !== 1) {
        reply.code(401).send({ error: 'Invalid username or password' })
        return;
      }
      const user = db.rows[0];
      const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex')

      console.log('hashedPassword', hashedPassword);

      if (hashedPassword !== user.pass) {
        return reply.status(400).send({ error: 'Invalid username or password' })
      }

      // Authorization successful!

      reply
        .setCookie('access', 'foo', {
          path: '/',
          httpOnly: true,
        })
        .setCookie('refresh', 'foo', {
          path: '/',
          httpOnly: true,
        })
        // TODO body is debugging information, then remove it
        .send({ message: 'Login successful', userId: user.id });
    }
    catch (err) {
      fastify.log.error(err)
      reply.status(500).send({ error: 'Internal Server Error' })
    }
  });
}
