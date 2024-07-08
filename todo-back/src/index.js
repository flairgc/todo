// index.js
const fastify = require('fastify')({ logger: true });
const { Pool } = require('pg');
const fastifyPostgres = require('fastify-postgres');
const fastifyJwt = require('fastify-jwt');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

fastify.register(fastifyPostgres, {
    connectionString: 'postgresql://postgres:password@localhost:5432/todo_app',
});

fastify.register(fastifyJwt, {
    secret: 'supersecret', // Секретный ключ для подписи JWT токенов
});

// Регистрация пользовательских роутов и логики

const PORT = process.env.PORT || 3000;

fastify.listen(PORT, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening on ${address}`);
});



// Регистрация пользователя
fastify.post('/register', async (request, reply) => {
    const { username, password } = request.body;

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    try {
        const result = await fastify.pg.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
            [username, passwordHash]
        );
        const user = result.rows[0];

        // Генерация JWT токена
        const token = jwt.sign({ id: user.id, username: user.username }, 'supersecret', { expiresIn: '1h' });

        reply.send({ token });
    } catch (err) {
        reply.status(500).send({ error: 'Registration failed' });
    }
});

// Аутентификация пользователя
fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body;

    try {
        const result = await fastify.pg.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            reply.status(401).send({ error: 'Invalid credentials' });
            return;
        }

        // Генерация JWT токена
        const token = jwt.sign({ id: user.id, username: user.username }, 'supersecret', { expiresIn: '1h' });

        reply.send({ token });
    } catch (err) {
        reply.status(500).send({ error: 'Login failed' });
    }
});



// Получение всех задач пользователя
fastify.get('/tasks', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.user;

    try {
        const result = await fastify.pg.query('SELECT * FROM tasks WHERE user_id = $1', [id]);
        reply.send(result.rows);
    } catch (err) {
        reply.status(500).send({ error: 'Failed to fetch tasks' });
    }
});

// Создание новой задачи
fastify.post('/tasks', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { title } = request.body;
    const { id } = request.user;

    try {
        const result = await fastify.pg.query(
            'INSERT INTO tasks (title, user_id) VALUES ($1, $2) RETURNING *',
            [title, id]
        );
        reply.send(result.rows[0]);
    } catch (err) {
        reply.status(500).send({ error: 'Failed to create task' });
    }
});

// Обновление задачи
fastify.put('/tasks/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const taskId = request.params.id;
    const { title } = request.body;

    try {
        const result = await fastify.pg.query(
            'UPDATE tasks SET title = $1 WHERE id = $2 RETURNING *',
            [title, taskId]
        );
        reply.send(result.rows[0]);
    } catch (err) {
        reply.status(500).send({ error: 'Failed to update task' });
    }
});

// Удаление задачи
fastify.delete('/tasks/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const taskId = request.params.id;

    try {
        await fastify.pg.query('DELETE FROM tasks WHERE id = $1', [taskId]);
        reply.send({ message: 'Task deleted successfully' });
    } catch (err) {
        reply.status(500).send({ error: 'Failed to delete task' });
    }
});


// index.js (добавление middleware для аутентификации)

// Middleware для проверки JWT токена
fastify.decorate('authenticate', async (request, reply) => {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.status(401).send({ error: 'Authentication failed' });
    }
});