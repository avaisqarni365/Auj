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

echo "==> 1/3 Pull latest (origin/main)"
git fetch origin
git reset --hard origin/main
# Bare host can't reach a Docker '@postgres' DATABASE_URL — neutralize it (localhost stays).
sed -i 's|^DATABASE_URL=postgresql://[^@]*@postgres:|# &|' infra/.env 2>/dev/null || true

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
