const fs = require('node:fs');
const path = require('node:path');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyDir(src, dest) {
  ensureDir(dest);
  fs.cpSync(src, dest, { recursive: true, force: true });
}

function main() {
  const root = path.resolve(__dirname, '..');
  const src = path.join(root, 'src', 'generated', 'prisma');
  const dest = path.join(root, 'dist', 'src', 'generated', 'prisma');
  if (!fs.existsSync(src)) {
    throw new Error(`Folder Prisma client tidak ditemukan: ${src}. Jalankan prisma generate dulu.`);
  }
  copyDir(src, dest);
  const indexJs = path.join(dest, 'index.js');
  if (!fs.existsSync(indexJs)) {
    throw new Error(
      `sync-generated-prisma gagal: ${indexJs} tidak ada setelah copy. Periksa output generator Prisma.`,
    );
  }
  // eslint-disable-next-line no-console
  console.log(`Synced Prisma client to ${dest}`);
}

main();

