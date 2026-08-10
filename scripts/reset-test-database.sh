#!/usr/bin/env bash
set -euo pipefail

container_name="${1:?container name is required}"
database_name="${2:?database name is required}"
root_password="${3:?root password is required}"

if [[ ! "$database_name" =~ ^[A-Za-z0-9_]*(test|ci_e2e)[A-Za-z0-9_]*$ ]]; then
  echo "Refusing to reset non-test database: $database_name" >&2
  exit 1
fi

docker exec "$container_name" mariadb \
  -uroot \
  "-p${root_password}" \
  -e "DROP DATABASE IF EXISTS \`${database_name}\`; CREATE DATABASE \`${database_name}\`;"
