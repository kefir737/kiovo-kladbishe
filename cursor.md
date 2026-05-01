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
2. Run local validation/tests relevant to change.
3. Commit on `main` and push to `origin/main`.
4. SSH to server repo (`/opt/kladbishe/vps`) and run `git pull`.
5. Run `docker compose up -d` if local checks passed.
6. Run post-deploy checks.

## Post-deploy checks (mandatory)

- `docker ps` (containers running, no restart loop)
- Health status for containers with healthcheck
- Endpoint checks from server host:
  - `/health`
  - `/api/content`
- On failure: inspect `docker logs` and `docker inspect` health logs.

## Current infrastructure notes

- Nginx on VPS proxies domains to docker services.
- There are two compose projects on server: `kiovo` and `granite`.
- This repo and workflow apply to `kiovo` unless explicitly stated otherwise.
