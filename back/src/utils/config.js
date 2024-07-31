function getConfig() {
  return {
    port: Number(process.env.APP_PORT),
    db_connection: process.env.APP_DB_CONNECTION_STRING,
    access_timeout: Number(process.env.APP_ACCESS_TIMEOUT_MIN),
    refresh_timeout: Number(process.env.APP_REFRESH_TIMEOUT_MIN),
  }
}

export const config = getConfig();
