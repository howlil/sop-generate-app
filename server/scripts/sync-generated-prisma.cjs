const fs = require('node:fs');
const path = require('node:path');

const COPY_RETRY_MS = 80;
const COPY_MAX_ATTEMPTS = 12;

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isEBUSY(err) {
  return err && (err.code === 'EBUSY' || err.code === 'EPERM');
}

async function copyDirWithRetry(src, dest) {
  ensureDir(dest);
  let lastError;
  for (let attempt = 1; attempt <= COPY_MAX_ATTEMPTS; attempt += 1) {
    try {
      fs.cpSync(src, dest, { recursive: true, force: true });
      return;
    } catch (err) {
      lastError = err;
      if (!isEBUSY(err) || attempt === COPY_MAX_ATTEMPTS) {
        throw err;
      }
      await sleep(COPY_RETRY_MS);
    }
  }
  throw lastError;
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const src = path.join(root, 'src', 'generated', 'prisma');
  const dest = path.join(root, 'dist', 'src', 'generated', 'prisma');
  if (!fs.existsSync(src)) {
    throw new Error(`Folder Prisma client tidak ditemukan: ${src}. Jalankan prisma generate dulu.`);
  }
  await copyDirWithRetry(src, dest);
  const indexJs = path.join(dest, 'index.js');
  if (!fs.existsSync(indexJs)) {
    throw new Error(
      `sync-generated-prisma gagal: ${indexJs} tidak ada setelah copy. Periksa output generator Prisma.`,
    );
  }
  // eslint-disable-next-line no-console
  console.log(`Synced Prisma client to ${dest}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
