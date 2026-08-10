#!/usr/bin/env bash
set -euo pipefail

container_name="${1:?container name is required}"
database_name="${2:?database name is required}"
database_user="${3:-ci}"
database_password="${4:-ci}"
root_password="${5:-ci-root-password}"

# Mirror compose.yml exactly: the migration history was created for a
# case-insensitive MariaDB table-name policy.
docker rm -f "$container_name" >/dev/null 2>&1 || true

docker run -d \
  --name "$container_name" \
  -p 3306:3306 \
  -e "MARIADB_ROOT_PASSWORD=$root_password" \
  -e "MARIADB_DATABASE=$database_name" \
  -e "MARIADB_USER=$database_user" \
  -e "MARIADB_PASSWORD=$database_password" \
  mariadb:11.4 \
  --lower_case_table_names=1 >/dev/null

for _ in $(seq 1 60); do
  if docker exec "$container_name" healthcheck.sh --connect --innodb_initialized >/dev/null 2>&1; then
    echo "MariaDB $container_name is ready with lower_case_table_names=1."
    exit 0
  fi
  sleep 2
done

echo "MariaDB $container_name did not become healthy." >&2
docker logs "$container_name" >&2 || true
exit 1
