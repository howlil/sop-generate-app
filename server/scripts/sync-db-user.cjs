const mysql = require('mysql2/promise');

const identifierPattern = /^[A-Za-z0-9_]+$/;

function readRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} wajib diisi`);
  }
  return value;
}

function readPort() {
  const raw = process.env.DATABASE_PORT || '3306';
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DATABASE_PORT tidak valid');
  }
  return port;
}

function validateIdentifier(name, value) {
  if (!identifierPattern.test(value)) {
    throw new Error(`${name} hanya boleh huruf, angka, dan underscore`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(options) {
  const maxAttempts = Number(process.env.DB_SYNC_MAX_ATTEMPTS || '30');
  const delayMs = Number(process.env.DB_SYNC_RETRY_DELAY_MS || '2000');

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await mysql.createConnection(options);
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      console.log(`Database belum siap untuk sync user, retry ${attempt}/${maxAttempts}...`);
      await sleep(delayMs);
    }
  }

  throw new Error('Database tidak siap untuk sync user');
}

async function main() {
  const host = process.env.DATABASE_HOST || 'db';
  const port = readPort();
  const database = readRequiredEnv('DATABASE_NAME');
  const appUser = readRequiredEnv('DATABASE_USER');
  const appPassword = readRequiredEnv('DATABASE_PASSWORD');
  const rootPassword = readRequiredEnv('DB_ROOT_PASSWORD');

  validateIdentifier('DATABASE_NAME', database);
  validateIdentifier('DATABASE_USER', appUser);

  const connection = await connectWithRetry({
    host,
    port,
    user: 'root',
    password: rootPassword,
    multipleStatements: false,
  });

  try {
    const account = `${connection.escape(appUser)}@${connection.escape('%')}`;
    const escapedPassword = connection.escape(appPassword);

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${connection.escapeId(database)}`);
    await connection.query(`CREATE USER IF NOT EXISTS ${account} IDENTIFIED BY ${escapedPassword}`);
    await connection.query(`ALTER USER ${account} IDENTIFIED BY ${escapedPassword}`);
    await connection.query(`GRANT ALL PRIVILEGES ON ${connection.escapeId(database)}.* TO ${account}`);
    await connection.query('FLUSH PRIVILEGES');
    console.log(`Database user '${appUser}' siap untuk database '${database}'.`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(`Gagal sinkronisasi user database: ${error.message}`);
  process.exit(1);
});
