#!/usr/bin/env bash
# Memicu listener webhook Komodo (tipe autentikasi GitHub).
# Dipakai GitHub Actions; butuh WEBHOOK_URL dan WEBHOOK_SECRET di environment.
set -euo pipefail

if [[ -z "${WEBHOOK_URL:-}" || -z "${WEBHOOK_SECRET:-}" ]]; then
  echo "WEBHOOK_URL dan WEBHOOK_SECRET wajib di-set." >&2
  exit 1
fi

REF_NAME="${GITHUB_REF_NAME:-final}"
REPOSITORY="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY wajib (owner/repo)}"

PAYLOAD=$(jq -n \
  --arg ref "refs/heads/${REF_NAME}" \
  --arg full_name "${REPOSITORY}" \
  --arg clone_url "https://github.com/${REPOSITORY}.git" \
  --arg html_url "https://github.com/${REPOSITORY}" \
  '{
    ref: $ref,
    repository: {
      full_name: $full_name,
      clone_url: $clone_url,
      html_url: $html_url
    }
  }')

SIG_HEX=$(printf '%s' "${PAYLOAD}" | openssl dgst -sha256 -hmac "${WEBHOOK_SECRET}" | awk '{print $2}')

HTTP_CODE=$(curl -sS -o /tmp/komodo-webhook-response.txt -w "%{http_code}" \
  -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -H "X-Hub-Signature-256: sha256=${SIG_HEX}" \
  -d "${PAYLOAD}")

echo "Komodo webhook HTTP ${HTTP_CODE}"
cat /tmp/komodo-webhook-response.txt || true

if [[ "${HTTP_CODE}" -lt 200 || "${HTTP_CODE}" -ge 300 ]]; then
  echo "Webhook gagal (kode ${HTTP_CODE})." >&2
  exit 1
fi
