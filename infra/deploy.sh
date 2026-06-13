#!/usr/bin/env bash
# Pull the latest image and restart the stack. Run ON the server (the deploy
# workflow ssh-es in and invokes this), or locally against a configured Docker host.
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "infra/.env is missing — copy .env.example to .env and fill it in." >&2
  exit 1
fi

echo "==> Pulling images"
docker compose --env-file .env pull

echo "==> Starting stack"
docker compose --env-file .env up -d

echo "==> Pruning old images"
docker image prune -f

echo "==> Status"
docker compose --env-file .env ps
