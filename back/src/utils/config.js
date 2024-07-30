function getConfig() {
  return {
    db_connection: process.env.APP_DB_CONNECTION_STRING,
    port: Number(process.env.APP_PORT),
  }
}

export const config = getConfig();
