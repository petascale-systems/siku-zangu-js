#!/bin/sh
set -e

atlas schema apply --url="$ATLASGO_URL" \
  --to=file://atlasgo/hcl \
  --var=database="$ATLASGO_VAR_DATABASE" \
  --auto-approve \
  --tx-mode file

# Data migrations run after the schema they depend on.
#
# The app decodes S_DATABASE_PASSWORD with decodeURIComponent, so it may arrive
# percent-encoded; decode it the same way before handing it to the client.
urldecode() {
  printf '%b' "$(printf '%s' "$1" | sed 's/+/ /g; s/%\(..\)/\\x\1/g')"
}

# `|| true` on purpose: this file is `set -e`, and a data migration must never
# be able to stop the service booting. The SQL is idempotent, so a failed run is
# simply retried on the next deploy.
MYSQL_PWD="$(urldecode "$S_DATABASE_PASSWORD")" \
  mysql --host="$S_DATABASE_HOST" \
        --port="${S_DATABASE_PORT:-3306}" \
        --user="$S_DATABASE_USER" \
        --database="$S_DATABASE_NAME" \
        --table \
        < ./atlasgo/sql/backfill-user-logs.sql || true

exec "$@"
