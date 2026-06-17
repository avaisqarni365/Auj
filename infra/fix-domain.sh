#!/usr/bin/env bash
# One-shot fix for "auj.codes-ai.uk shows the wrong app".
#
# Cause: AUJ's nginx vhost proxied to 127.0.0.1:3000, but another app on this shared box
# already owns :3000 — so the domain served that app. This moves AUJ to a dedicated host
# port (3080), repoints the vhost, and redeploys. Idempotent + safe to re-run.
#
# Run as ROOT from the cloned repo on the server:
#   sudo bash infra/fix-domain.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"
DOMAIN="${DOMAIN:-auj.codes-ai.uk}"
PORT="${WEB_PORT:-3080}"

echo "==> 1/4 Pull latest code"
git pull --ff-only origin main 2>/dev/null || echo "   (git pull skipped — using on-disk code)"

echo "==> 2/4 Configure infra/.env (local image + free port $PORT)"
if [ ! -f infra/.env ]; then
  cp infra/.env.example infra/.env
  sed -i "s|change-me|$(openssl rand -hex 12)|g" infra/.env
  sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$(openssl rand -hex 6)|" infra/.env
  echo "   created infra/.env from example (admin password randomized — see end)"
fi
# Use the image we build locally below, and a host port that won't collide with :3000.
grep -q '^WEB_IMAGE=' infra/.env \
  && sed -i "s|^WEB_IMAGE=.*|WEB_IMAGE=auj-web:local|" infra/.env \
  || echo "WEB_IMAGE=auj-web:local" >> infra/.env
grep -q '^WEB_PORT=' infra/.env \
  && sed -i "s|^WEB_PORT=.*|WEB_PORT=$PORT|" infra/.env \
  || echo "WEB_PORT=$PORT" >> infra/.env

echo "==> 3/4 Deploy (build image, run AUJ on :$PORT, repoint nginx, certbot)"
DOMAIN="$DOMAIN" bash infra/server-deploy.sh

echo "==> 4/4 Verify"
TITLE="$(curl -s "http://127.0.0.1:$PORT/" | grep -oiE '<title>[^<]*</title>' | head -1 || true)"
echo "   local http://127.0.0.1:$PORT title -> ${TITLE:-<none>}"
case "$TITLE" in
  *AUJ*) echo "   ✅ AUJ is now served on :$PORT — load https://$DOMAIN" ;;
  *)     echo "   ⚠️  Title is not AUJ. Check: docker ps  |  sudo nginx -T | grep -A2 'server_name auj'" ;;
esac
