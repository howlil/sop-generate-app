#!/bin/sh
set -e

pnpm preview --host 127.0.0.1 --port 4173 &
PREVIEW_PID=$!

cleanup() {
  kill "$PREVIEW_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

exec nginx -g 'daemon off;'
