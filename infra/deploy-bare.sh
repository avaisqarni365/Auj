#!/usr/bin/env bash
# Run AUJ WITHOUT Docker — directly with Node + systemd, fronted by the existing nginx.
# Installs Node 20 + pnpm if missing, builds the web app, runs `next start` on WEB_PORT
# (default 3080) as a systemd service (auto-restart + start on boot), repoints the nginx
# vhost, and gets a TLS cert. Runs in IN-MEMORY mode (no external datastores) unless you
# export DATABASE_URL/REDIS_URL to point at a database you manage.
#
# Run as ROOT from the cloned repo on the server:
#   sudo bash infra/deploy-bare.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"
DOMAIN="${DOMAIN:-auj.codes-ai.uk}"
EMAIL="${ACME_EMAIL:-admin@codes-ai.uk}"
PORT="${WEB_PORT:-3080}"

echo "==> 1/6 Node 20 + pnpm"
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | sed 's/v//;s/\..*//')" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
corepack enable 2>/dev/null && corepack prepare pnpm@10.33.4 --activate 2>/dev/null || npm i -g pnpm
echo "   node $(node -v) · pnpm $(pnpm -v)"

echo "==> 2/6 Stop any Docker copy so it doesn't fight for port $PORT"
(cd infra && docker compose down 2>/dev/null) || true

echo "==> 3/6 Install deps + build (a few minutes)"
pnpm install --prod=false
pnpm --filter @auj/web build:next

echo "==> 4/6 systemd service (auj) on 127.0.0.1:$PORT"
PNPM_BIN="$(command -v pnpm)"
cat > /etc/systemd/system/auj.service <<UNIT
[Unit]
Description=AUJ web (Next.js, no Docker)
After=network.target

[Service]
Type=simple
WorkingDirectory=$REPO_DIR/apps/web
Environment=NODE_ENV=production
Environment=PORT=$PORT
Environment=HOSTNAME=127.0.0.1
Environment=APP_ORIGIN=https://$DOMAIN
# In-memory by default. To use a database, add e.g.:
# Environment=DATABASE_URL=postgresql://user:pass@localhost:5432/auj
ExecStart=$PNPM_BIN --filter @auj/web start
Restart=always
RestartSec=3
User=root

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now auj
sleep 5
echo "   app on 127.0.0.1:$PORT -> HTTP $(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || echo down)"

echo "==> 5/6 nginx vhost for $DOMAIN (additive; proxy kept in sync with port $PORT)"
command -v certbot >/dev/null 2>&1 || { apt-get update && apt-get install -y certbot python3-certbot-nginx; }
sed "s|127\.0\.0\.1:3080|127.0.0.1:$PORT|g" nginx-auj.conf > "/etc/nginx/sites-available/$DOMAIN"
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
if ! nginx -t; then echo "!! nginx test failed — reverting"; rm -f "/etc/nginx/sites-enabled/$DOMAIN"; exit 1; fi
systemctl reload nginx

echo "==> 6/6 TLS certificate"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || \
  echo "!! certbot failed (DNS/port 80?) — site still works on http://$DOMAIN; re-run certbot later."
systemctl reload nginx || true

echo
echo "================ DONE (no Docker) ================"
TITLE="$(curl -s "http://127.0.0.1:$PORT/" | grep -oiE '<title>[^<]*</title>' | head -1 || true)"
echo "Local title: ${TITLE:-<none>}"
case "$TITLE" in
  *AUJ*) echo "✅ AUJ running on :$PORT via systemd — open https://$DOMAIN" ;;
  *)     echo "⚠️  Not AUJ yet — check: journalctl -u auj -n 40 --no-pager" ;;
esac
echo "Manage it:  systemctl status auj   |   journalctl -u auj -f   |   systemctl restart auj"
