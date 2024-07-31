import crypto from "crypto";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function createSession(fastify, { userId, userAgent, userIP }) {
  const access = generateToken();
  const refresh = generateToken();

  await fastify.pg.query(
    `INSERT INTO sessions (user_id, access_token, refresh_token, device, user_ip)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, access, refresh, userAgent, userIP],
  );

  return { access, refresh };
}
