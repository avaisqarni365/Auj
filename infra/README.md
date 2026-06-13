# Deployment

AUJ ships as a single Docker image (the unified `web` Next.js app — landing, `/book`, `/agent`, `/admin`, auth) plus a Postgres/Redis/MinIO stack.

## Pipeline overview
- **CI** (`.github/workflows/ci.yml`) on every push/PR: install → lint → typecheck → test → build, then a Docker build of the app image (not pushed).
- **Deploy** (`.github/workflows/deploy.yml`) on a `v*` tag (or manual run):
  1. Builds + pushes `ghcr.io/<owner>/<repo>-web` to GHCR.
  2. If deploy secrets are set, SSHes to the server, copies `infra/`, and runs `deploy.sh`.

## DB choice
PostgreSQL (Prisma `provider = "postgresql"`). SQLite is fine for local dev. The
runtime currently uses in-memory repositories; wiring the Prisma adapter is the next
infra step. **MySQL is not used.**

## Datastores are tunnel-only
`infra/docker-compose.yml` binds Postgres/Redis/MinIO to `127.0.0.1` on the host, so
they are NOT reachable from the internet. To connect from your machine, open an SSH
tunnel and point your client at localhost:

```bash
ssh -N -L 5432:localhost:5432 <user>@<server>
# then:  DATABASE_URL=postgresql://auj:***@localhost:5432/auj
```

## First-time server setup
1. Install Docker + the compose plugin.
2. `mkdir -p ~/auj/infra` and copy `infra/docker-compose.yml`, `infra/deploy.sh`, and a filled `infra/.env` (from `.env.example`).
3. `docker login ghcr.io` with a PAT that can read packages.
4. `cd ~/auj/infra && bash deploy.sh`.

## GitHub secrets for auto-deploy
Set under repo → Settings → Secrets:
- `DEPLOY_HOST` — server IP/host
- `DEPLOY_USER` — ssh user (prefer a non-root deploy user)
- `DEPLOY_SSH_KEY` — private key (ed25519) whose public key is in the server's `authorized_keys`

If `DEPLOY_HOST` is unset, the deploy job still builds + pushes the image and just skips the remote step.

## Release
```bash
git tag v0.1.0 && git push origin v0.1.0   # triggers build → push → deploy
```

## Rollback
On the server, set `WEB_IMAGE` to a previous tag (e.g. `...-web:<sha>`) in `infra/.env` and re-run `bash deploy.sh`.

## Local production build (no registry)
```bash
docker build -f apps/web/Dockerfile -t auj-web .
docker run --rm -p 3000:3000 auj-web
```

## Security notes
- The IONOS root password was shared in chat — rotate it and switch to key-based SSH; create a dedicated `deploy` user rather than deploying as root.
- Keep `infra/.env` off git (gitignored). Use strong `POSTGRES_PASSWORD` / object-store keys.
