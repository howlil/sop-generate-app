# Komodo — deploy otomatis

Push ke branch **`final`** → GitHub Actions memicu Komodo → deploy + migrasi.

## Setup sekali

1. Pasang Komodo + Periphery di VPS (`server-prod`).
2. Impor [`bootstrap.toml`](bootstrap.toml) sebagai **Resource Sync** → jalankan Sync.
3. Isi **Variables** di Komodo (nama dari [`.env.example`](../.env.example)).
4. Tambah GitHub Secrets: `KOMODO_WEBHOOK_SECRET`, `KOMODO_PROCEDURE_WEBHOOK_URL`, (opsional) `KOMODO_SYNC_WEBHOOK_URL`.

Panduan lengkap: [docs/deploy-komodo.md](../docs/deploy-komodo.md)
