# Working Context: kiovo-kladbishe

## Repositories and paths

- Local workspace root: `C:\Users\user\Documents\00code`
- Main local repo: `C:\Users\user\Documents\00code\kiovo-kladbishe`
- Server host: `7e5f18fb7dcc.vps.myjino.ru`
- Server user: `root`
- Server repo path: `/opt/kladbishe/vps`
- SSH key path (local): `C:\Users\user\.ssh\id_ed25519`

## Branch and workflow policy

- Working branch: `main`
- Edit files locally first.
- Run local checks/tests before any deploy step.
- Push to git from local repo.
- Update server only via git pull from the same branch.
- Restart docker services only if local checks passed.
- Always run automatic post-deploy checks.

## Standard execution order

1. Edit in local repo.
2. Run local frontend validation only (no local Docker required):
   - frontend build (`npm run build`)
   - optional preview/dev check on localhost (`npm run dev`)
3. Commit on `main` and push to `origin/main`.
4. SSH to server repo (`/opt/kladbishe/vps`) and run `git pull`.
5. Run `docker compose up -d --build` on VPS.
6. Run post-deploy checks.

## Post-deploy checks (mandatory)

- `docker ps` (containers running, no restart loop)
- Health status for containers with healthcheck
- Endpoint checks from server host:
  - `/health`
  - `/api/content`
- On failure: inspect `docker logs` and `docker inspect` health logs.

### Post-deploy command checklist (copy/paste)

```bash
docker ps
docker inspect kiovo-frontend-1 --format='{{json .State.Health}}'
docker inspect kiovo-backend-1 --format='{{json .State.Health}}'
curl -fsS http://127.0.0.1/health
curl -fsS http://127.0.0.1:8000/api/content
```

## Current infrastructure notes

- Nginx on VPS proxies domains to docker services.
- There are two compose projects on server: `kiovo` and `granite`.
- This repo and workflow apply to `kiovo` unless explicitly stated otherwise.

## Runtime/deployment specifics (kiovo)

- Main runtime healthchecks currently expected:
  - frontend: `http://127.0.0.1/health`
  - backend: python urllib probe to `http://127.0.0.1:8000/api/content`
- Existing server deployment path: `/opt/kladbishe/vps`.
- Domain routing:
  - `kladbishe-kiovo.ru` -> nginx -> `127.0.0.1:8082` (kiovo frontend container)
- If container state is `unhealthy`, inspect:
  - `docker inspect <container> --format='{{json .State.Health}}'`
  - `docker logs --tail 200 <container>`

## SSH/Security operational notes (server-wide)

- Access model explicitly requested by owner:
  - keep root access enabled
  - keep password authentication enabled
  - do NOT enforce `PermitRootLogin prohibit-password`
- Safe hardening already applied server-wide:
  - `ufw` enabled with allowlist `22/80/443`
  - `fail2ban` active (`sshd` jail)
  - SSH limits tuned (`MaxAuthTries`, `LoginGraceTime`, keepalive)
