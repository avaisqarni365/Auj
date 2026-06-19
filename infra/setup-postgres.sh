#!/usr/bin/env bash
# Add PostgreSQL persistence to the bare (no-Docker) AUJ deploy. Installs Postgres on the host,
# creates the auj database + user, writes DATABASE_URL into infra/.env, and restarts the service.
# Idempotent (safe to re-run; reuses the existing password if one is already set). After this,
# bookings, accounts, support tickets and Smart Visit leads all persist across restarts — the app
# auto-creates its tables on first request.
#
# Run as ROOT from the cloned repo:  sudo bash infra/setup-postgres.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"
DB="${PGDATABASE:-auj}"
DBUSER="${PGUSER:-auj}"
PORT="${WEB_PORT:-3080}"

# Run a command as the postgres user without interactive sudo (sudo may be disabled; we're root).
as_postgres() {
  if command -v runuser >/dev/null 2>&1; then runuser -u postgres -- "$@";
  elif command -v sudo >/dev/null 2>&1; then sudo -u postgres "$@";
  else su -s /bin/sh postgres -c "$(printf '%q ' "$@")"; fi
}

echo "==> 1/4 Install PostgreSQL"
command -v psql >/dev/null 2>&1 || { apt-get update && apt-get install -y postgresql; }
systemctl enable --now postgresql

echo "==> 2/4 Create database + user (idempotent)"
[ -f infra/.env ] || cp infra/.env.example infra/.env
# Reuse the existing password if DATABASE_URL is already configured, else generate a new one.
EXISTING="$(grep -E '^DATABASE_URL=' infra/.env 2>/dev/null | sed -E 's#.*://[^:]+:([^@]+)@.*#\1#')"
PASS="${EXISTING:-$(openssl rand -hex 16)}"
as_postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='${DBUSER}') THEN
    CREATE ROLE ${DBUSER} LOGIN PASSWORD '${PASS}';
  ELSE
    ALTER ROLE ${DBUSER} PASSWORD '${PASS}';
  END IF;
END \$\$;
SQL
as_postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB}'" | grep -q 1 \
  || as_postgres createdb -O "${DBUSER}" "${DB}"

echo "==> 3/4 Wire DATABASE_URL into infra/.env"
URL="postgresql://${DBUSER}:${PASS}@localhost:5432/${DB}"
if grep -qE '^DATABASE_URL=' infra/.env; then
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${URL}|" infra/.env
else
  echo "DATABASE_URL=${URL}" >> infra/.env
fi

echo "==> 4/4 Restart the app"
systemctl restart auj 2>/dev/null || echo "   (auj service not found — run infra/deploy-bare.sh first, then re-run this)"
sleep 4
echo "   app on 127.0.0.1:$PORT -> HTTP $(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || echo down)"

echo
echo "================ DONE ================"
echo "PostgreSQL is wired. Bookings, accounts, support tickets and Smart Visit leads now persist."
echo "Tables are created automatically on first use. DB: ${DB} · user: ${DBUSER} (localhost:5432)."
