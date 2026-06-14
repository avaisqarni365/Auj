# AUJ — Deploy Runbook

Concrete, copy-paste steps to ship the unified `@auj/web` app. Everything below is ready;
the only things that require **you** are the server host and the secret values.

## 0. What ships
One Docker image (`apps/web/Dockerfile`, published as `ghcr.io/<owner>/<repo>-web`) running the
whole app (landing, `/book`, `/agent`, `/admin`, `/support`, `/bookings`, auth) on port 3000,
plus Postgres + Redis + MinIO from `infra/docker-compose.yml`.

> **Build note:** `next build` (standalone output) fails on **Windows** with an EPERM symlink
> error — do NOT build the image locally on Windows. The image builds cleanly on **Linux**
> (GitHub Actions CI and the server both build fine). Use the CI pipeline, not a local build.

## 1. Prerequisites (you provide)
- A Linux server (e.g. the IONOS box `212.227.54.250`) with Docker + the compose plugin.
- A non-root `deploy` user with SSH key access (don't deploy as root).
- GHCR read access on the server (`docker login ghcr.io` with a PAT that can read packages).
- (Optional) a domain + TLS reverse proxy (Caddy/Traefik/nginx) in front of port 3000.

## 2. Secrets / env (you fill in `infra/.env` on the server)
Copy `infra/.env.example` → `infra/.env` and set:

| Var | Required | Notes |
|---|---|---|
| `WEB_IMAGE` | ✅ | `ghcr.io/<owner>/<repo>-web:latest` (or a pinned `:vX.Y.Z` / `:<sha>`) |
| `WEB_PORT` | ✅ | host port (default 3000) |
| `POSTGRES_USER/PASSWORD/DB` | ✅ | use a strong password |
| `DATABASE_URL` | ✅ | `postgresql://USER:PASS@postgres:5432/auj?schema=public` — **enables Postgres + auto-migrates** |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | ✅ | seeded admin (change from the demo default!) |
| `CONNECTOR` | ✅ | `mock` until the Saudi connector is certified, then `saudi` |
| `SUPPLIER` | ✅ | `mock` until live bedbank/GDS, then `live` |
| `STRIPE_SECRET_KEY` | ⬜ | set to take real EUR card payments (else sandbox) |
| `PKR_GATEWAY_URL` / `PKR_GATEWAY_KEY` | ⬜ | set for the real PKR acquirer (else sandbox) |
| `EMAIL_API_URL` / `EMAIL_API_KEY` / `EMAIL_FROM` | ⬜ | set for real email (else log adapter) |
| `OBJECT_STORE_ACCESS_KEY` / `SECRET_KEY` | ✅ | MinIO credentials |
| `REDIS_URL` | ✅ | `redis://redis:6379` |

**Migrations:** there is no separate migration step — the app applies the schema
(`migrate` + `migrateAuth` + `migrateSupport`) lazily on the first request once `DATABASE_URL` is set.

## 3. First-time server setup
```bash
ssh deploy@<host>
mkdir -p ~/auj/infra
# copy infra/docker-compose.yml, infra/deploy.sh, and your filled infra/.env into ~/auj/infra
docker login ghcr.io          # PAT with read:packages
cd ~/auj/infra && bash deploy.sh
```
`deploy.sh` pulls the image and runs `docker compose --env-file .env up -d`.

## 4. CI/CD (already wired)
- **CI** (`.github/workflows/ci.yml`): every push/PR → install → lint → typecheck → test → build,
  then a Docker build of `apps/web/Dockerfile` (not pushed). This is the gate.
- **Deploy** (`.github/workflows/deploy.yml`): on a `v*` tag (or manual run):
  1. Builds + pushes `ghcr.io/<owner>/<repo>-web` (tags: the version, the sha, `latest`).
  2. If `DEPLOY_HOST` is set, SSHes in, copies `infra/`, and runs `deploy.sh` with `WEB_IMAGE=…:latest`.

**GitHub secrets to enable auto-deploy** (Settings → Secrets):
- `DEPLOY_HOST` — server IP/host
- `DEPLOY_USER` — the `deploy` ssh user
- `DEPLOY_SSH_KEY` — private key whose public key is in the server's `authorized_keys`

If `DEPLOY_HOST` is unset, the deploy job still builds + pushes the image and skips the remote step.

## 5. Release
```bash
git tag v0.1.0 && git push origin v0.1.0   # → build → push → (deploy if secrets set)
```

## 6. Smoke test (after deploy)
```bash
curl -s -o /dev/null -w '%{http_code}\n' http://<host>:3000/          # 200
curl -s -o /dev/null -w '%{http_code}\n' http://<host>:3000/login     # 200
curl -s -o /dev/null -w '%{http_code}\n' http://<host>:3000/book      # 307 → /login (guard)
```
Then in a browser: log in as the seeded admin, open `/admin`, confirm the views load.

## 7. Rollback
On the server, set `WEB_IMAGE` to a previous tag (e.g. `…-web:<sha>`) in `infra/.env` and
re-run `bash deploy.sh`.

## 8. Datastores are tunnel-only
`docker-compose.yml` binds Postgres/Redis/MinIO to `127.0.0.1` on the host. To reach Postgres
from your machine, open an SSH tunnel — never expose 5432:
```bash
ssh -N -L 5432:localhost:5432 deploy@<host>
# then: DATABASE_URL=postgresql://auj:***@localhost:5432/auj
```

## 9. Security checklist
- Rotate the IONOS root password (it was shared in chat); deploy as a non-root `deploy` user.
- Change `ADMIN_PASSWORD` from the demo default before first boot.
- Strong `POSTGRES_PASSWORD` / object-store keys; keep `infra/.env` off git (gitignored).
- Put TLS in front (the app speaks plain HTTP on 3000).

## 10. Still gated on partner access (not blockers for launch)
- `CONNECTOR=saudi` needs Maqam/Nusuk partner credentials (general-travel leg can launch first).
- Live card capture additionally needs the Stripe.js client step (server adapter is ready).
