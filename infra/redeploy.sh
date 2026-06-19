#!/usr/bin/env bash
# Lightweight redeploy for CI/CD on the no-Docker host. Assumes infra/deploy-bare.sh has run
# once (Node, pnpm, nginx, certbot, the `auj` systemd service and infra/.env already exist).
# Pulls main, rebuilds, restarts. Invoked over SSH by the Deploy workflow, or run by hand.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"
PORT="${WEB_PORT:-3080}"
# Non-login SSH shells often have a thin PATH — make sure node/pnpm are reachable.
export PATH="/usr/local/bin:/usr/bin:/bin:${HOME:-/root}/.local/share/pnpm:$PATH"
command -v pnpm >/dev/null 2>&1 || corepack enable 2>/dev/null || true
command -v pnpm >/dev/null 2>&1 || corepack prepare pnpm@10.33.4 --activate 2>/dev/null || true
command -v pnpm >/dev/null 2>&1 || { echo "!! pnpm not found (PATH=$PATH). Run infra/deploy-bare.sh once to install Node+pnpm."; exit 127; }
echo "using $(pnpm -v) at $(command -v pnpm)"

echo "==> 1/3 Pull latest (origin/main)"
git fetch origin
git reset --hard origin/main
# Bare host can't reach a Docker '@postgres' DATABASE_URL — neutralize it (localhost stays).
sed -i 's|^DATABASE_URL=postgresql://[^@]*@postgres:|# &|' infra/.env 2>/dev/null || true

# Ensure PostgreSQL persistence the first time (idempotent; the marker keeps later deploys fast).
# Without this the app runs in-memory and loses data (bookings, leads, content edits) on restart.
if [ ! -f infra/.postgres-ready ]; then
  echo "==> Ensuring PostgreSQL (first deploy)"
  if bash infra/setup-postgres.sh; then touch infra/.postgres-ready; else echo "!! postgres setup failed — app continues in-memory; will retry next deploy"; fi
fi

echo "==> 2/3 Build (workspace deps first, then the app)"
pnpm install --prod=false --frozen-lockfile || pnpm install --prod=false
pnpm --filter "@auj/web..." build
pnpm --filter @auj/web build:next

echo "==> 3/3 Restart service (free the port first — kills any stray AUJ next-server)"
systemctl stop auj 2>/dev/null || true
# Kill only AUJ's own Next process (scoped to this repo path) in case one was started outside systemd.
pkill -f "$REPO_DIR/apps/web" 2>/dev/null || true
# Free the port if anything AUJ-related still holds it.
fuser -k "${PORT}/tcp" 2>/dev/null || true
sleep 2
systemctl start auj
sleep 5
CODE="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || echo down)"
echo "redeploy -> HTTP $CODE"
[ "$CODE" = "200" ] || { echo '!! not healthy — last logs:'; journalctl -u auj -n 20 --no-pager || true; }

echo "==> 4/4 Ensure the domain routes to this app (nginx vhost + TLS; additive, idempotent)"
DOMAIN="${DOMAIN:-auj.codes-ai.uk}"
EMAIL="${ACME_EMAIL:-admin@codes-ai.uk}"
if command -v nginx >/dev/null 2>&1; then
  # Install/repoint the AUJ vhost to this port. server_name-scoped, so other sites are untouched.
  sed "s|127\.0\.0\.1:3080|127.0.0.1:$PORT|g" infra/nginx-auj.conf > "/etc/nginx/sites-available/$DOMAIN"
  ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
  if nginx -t 2>/dev/null; then
    systemctl reload nginx
    echo "   nginx: $DOMAIN -> 127.0.0.1:$PORT (reloaded)"
  else
    echo "!! nginx -t failed — left unchanged (other sites safe)"
  fi
  # Re-apply TLS every deploy: we just overwrote the HTTP-only vhost, which removes the :443
  # server block certbot adds — so on HTTPS the domain would fall through to the default site.
  # `certbot --nginx` re-adds the :443 block + redirect using the existing cert (or obtains one
  # on first run); --keep-until-expiring means it never needlessly re-issues.
  if command -v certbot >/dev/null 2>&1; then
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect --keep-until-expiring \
      || echo "!! certbot failed — http://$DOMAIN works; check DNS + port 80/443 open"
    systemctl reload nginx || true
  else
    echo "!! certbot not installed — HTTPS not configured; run infra/deploy-bare.sh once"
  fi
else
  echo "!! nginx not installed — run infra/deploy-bare.sh once to set up the reverse proxy"
fi
echo "Open https://$DOMAIN"
