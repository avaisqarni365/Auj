#!/usr/bin/env bash
# One-shot AUJ deploy for an Ubuntu host that already runs nginx (e.g. the IONOS box).
# Builds the app image locally (no GHCR login needed), runs it on 127.0.0.1:$WEB_PORT (default
# 3080 — off :3000 so it won't collide with another app on this box), and fronts
# it with the EXISTING nginx + a Let's Encrypt cert for the domain. Additive + guarded:
# nginx is only reloaded if `nginx -t` passes, so other sites on this nginx are never at risk.
#
# Run as root from the cloned repo:
#   sudo bash infra/server-deploy.sh
set -euo pipefail

DOMAIN="${DOMAIN:-auj.codes-ai.uk}"
EMAIL="${ACME_EMAIL:-admin@codes-ai.uk}"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "==> 1/6 Docker"
command -v docker >/dev/null || curl -fsSL https://get.docker.com | sh

echo "==> 2/6 Build app image (auj-web:local) — takes a few minutes"
docker build -f apps/web/Dockerfile -t auj-web:local .

echo "==> 3/6 Configure infra/.env"
cd infra
if [ ! -f .env ]; then
  cp .env.example .env
  PG="$(openssl rand -hex 12)"; ADM="$(openssl rand -hex 6)"
  sed -i "s|WEB_IMAGE=.*|WEB_IMAGE=auj-web:local|" .env
  sed -i "s|change-me|$PG|g" .env
  sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$ADM|" .env
fi

echo "==> 4/6 Start app + datastores (Caddy profile stays off; host nginx fronts it)"
docker compose up -d
sleep 6
# Host port AUJ is published on (defaults to 3080 to avoid colliding with other apps on :3000).
PORT="$(grep -E '^WEB_PORT=' .env | cut -d= -f2- | tr -d '[:space:]')"; PORT="${PORT:-3080}"
echo "   app on 127.0.0.1:$PORT -> HTTP $(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || echo down)"

echo "==> 5/6 nginx vhost for $DOMAIN (additive + guarded; proxy_pass kept in sync with WEB_PORT=$PORT)"
command -v certbot >/dev/null || { apt-get update && apt-get install -y certbot python3-certbot-nginx; }
# Rewrite the vhost's proxy port to the actual WEB_PORT so nginx always hits the AUJ container.
sed "s|127\.0\.0\.1:3080|127.0.0.1:$PORT|g" nginx-auj.conf > "/etc/nginx/sites-available/$DOMAIN"
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
if ! nginx -t; then
  echo "!! nginx config test FAILED — reverting, your other sites are untouched."
  rm -f "/etc/nginx/sites-enabled/$DOMAIN"
  exit 1
fi
systemctl reload nginx

echo "==> 6/6 TLS certificate (Let's Encrypt via certbot)"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || \
  echo "!! certbot failed (check DNS/port 80). The site still works on http://$DOMAIN; re-run certbot later."
systemctl reload nginx || true

echo
echo "================ DONE ================"
echo "Site:  https://$DOMAIN"
echo "Admin: $(grep '^ADMIN_EMAIL' .env | cut -d= -f2-) / $(grep '^ADMIN_PASSWORD' .env | cut -d= -f2-)"
echo "Change the admin password after first login, and rotate the server root password."
