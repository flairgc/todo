import crypto from 'crypto';
import { createSession } from '../../utils/token.js';


export async function authRoutes(fastify) {

  fastify.post('/register', async (request, reply) => {

    const { login, password, name, passwordHint } = request.body;

    if (!login || !password) {
      return reply.status(400).send({ error: 'Username and password are required' });
    }

    try {
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')

      const { rows } = await fastify.pg.query(
        'insert into todo.users (login, pass, salt, name, password_hint) values ($1, $2, $3, $4, $5) returning id',
        [login, hashedPassword, salt, name, passwordHint]
      )

      return reply.send({ userId: rows[0].id })
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Internal Server Error' })
    }
  });

  fastify.post('/login', async (request, reply) => {

    const { login, password } = request.body;

    // validation
    if ( typeof login !== 'string' || typeof password !== 'string' || !login || !password) {
      return reply.code(400).send({ error: 'There is no login or password' });
    }

    try {
      const db = await fastify.pg.query(
        'SELECT id, login, pass, salt FROM todo.users WHERE login=$1', [login],
      )

      if (db.rows.length !== 1) {
        return reply.code(401).send({ error: 'Invalid username or password' });
      }
      const user = db.rows[0];
      const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex')

      if (hashedPassword !== user.pass) {
        return reply.status(400).send({ error: 'Invalid username or password' })
      }

      const { access, refresh } = await createSession(fastify, {
        userId: user.id,
        userAgent: request.headers['user-agent'],
        userIP: request.ip,
      });

      return reply
        .setCookie('access', access, {
          path: '/',
          httpOnly: true,
        })
        .setCookie('refresh', refresh, {
          path: '/',
          httpOnly: true,
        })
        // TODO body is debugging information, then remove it
        .send({ message: 'Login successful', userId: user.id });
    }
    catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Internal Server Error' })
    }
  });

  fastify.get('/refreshToken', async (request, reply) => {

    const { refresh } = request.cookies;

    try {
      const transaction = await fastify.pg.query(
        'delete from todo.sessions where refresh_token=$1 and now() < expire_refresh_at returning user_id', [refresh],
      );

      if (transaction.rows.length === 0) {
        return reply.code(401).send({ error: 'Unauthorized' })
      }

      const user = transaction.rows[0];

      const { access: newAccess, refresh: newRefresh } = await createSession(fastify, {
        userId: user.user_id,
        userAgent: request.headers['user-agent'],
        userIP: request.ip,
      });

      return reply
        .setCookie('access', newAccess, {
          path: '/',
          httpOnly: true,
        })
        .setCookie('refresh', newRefresh, {
          path: '/',
          httpOnly: true,
        })
        // TODO body is debugging information, then remove it
        .send({ message: 'Refresh token updated' });
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Internal Server Error' })
    }
  });
}
