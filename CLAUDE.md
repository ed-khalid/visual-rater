# Visual Rater

A personal music rating app (songs, albums, artists) whose point is the *rating interaction itself*: visual, D3/drag-driven raters instead of star or number inputs.

Project notes, status, and Progress History are kept outside this repo in `~/projects/04-todo/code-visual-rater/AGENTS.md`. If that folder has moved, look in the other status folders under `~/projects/`. Record design decisions and progress there, not here.

## Layout

This is a monorepo built from three formerly separate repos. Each history was rewritten into a subfolder (see `~/code/create-visual-rater-monorepo.sh`).

| Folder | Stack | Port |
|---|---|---|
| `frontend/` | React 19, TypeScript, Vite, Apollo Client, D3 7, dnd-kit, motion | 3000 |
| `backend/` | Kotlin, Spring Boot 3.4 (spring-graphql, JPA/Hibernate), Arrow, Postgres | 9000 |
| `imageservice/` | Python, FastAPI: dominant colors and image similarity for cover art | 7011 |

Request flow: frontend → GraphQL (HTTP for queries and mutations, WebSocket for subscriptions) at `localhost:9000/graphql` → backend → Postgres, Spotify Web API, imageservice.

## Running locally

1. **Postgres:** database `visual_rater`, user `visual_rater_app`, on `localhost:5432`.
2. **imageservice:** `cd imageservice && .venv/bin/python main.py` (listens on 7011).
3. **backend:** `cd backend && ./gradlew bootRun`. Set `VISUAL_RATER_DATABASE_PW` and `VISUAL_RATER_SPOTIFY_CLIENT_SECRET` in the environment.
4. **frontend:** `cd frontend && npm install && npm start`. The backend URL is hardcoded in `src/setupApollo.ts`.

## Frontend

- GraphQL documents live in `src/graphql/{queries,mutations,subscriptions,fragments}/*.graphql`.
- `src/generated/graphql.tsx` and `graphql.schema.json` are generated. Don't edit them by hand. Regenerate with `npm run graphql`, which needs the backend running because it introspects `localhost:9000/graphql`.
- State: reducer and providers in `src/music/` and `src/providers/`, data hooks in `src/hooks/`.
- Raters are in `src/components/raters/`:
  - `linear/`: D3 circles on a scale, with comparison songs
  - `grid/`: block/grid placement
  - `playlist/`: drag to reorder; the new score is interpolated from the neighbors' scores
- `deprecated/` holds old code kept for reference. Don't build on it.
- Checks: `npm run typecheck`, `npm test` (vitest).
- `todo.md` is the running backlog.

## Backend

- Package `com.hawazin.visualrater`: `controllers/` (GraphQL resolvers), `services/` (Spotify, imageservice, publishers for subscriptions), `configurations/`.
- Schema: `src/main/resources/graphql/*.graphqls`. After any schema change, regenerate the frontend types.
- Tests: kotest and mockk, run with `./gradlew test`. Coverage is thin.

## Data model

- Every rater writes the same thing: a single numeric `score` per song, roughly 1–5 in 0.25 steps. The tier names are in `frontend/README.md`. A new rater that needs a different representation (relative placement, for example) is a data-model decision, not just a UI change, so raise it before implementing.
- DB migrations are hand-numbered SQL in `backend/db/NN.description.sql` and applied manually. Add new ones as the next number; don't edit applied files. Hibernate `ddl-auto: update` also runs, so check that entity changes and migrations agree.
- `backend/backup.sql` is a data snapshot, not a migration.
- Full DB backup (schema, data, functions, triggers) taken 2026-11-03, before a possible rework: `~/projects/04-todo/code-visual-rater/db-backups/visual_rater-20261103-0731.dump` (restore with `pg_restore`), plus a plain-SQL copy `visual_rater-20261103-0731.sql` in the same folder. It doesn't include the `visual_rater_app` role; create that first. If the project folder moves to another status folder under `~/projects/`, the backups move with it.

## Conventions

- Commit messages are prefixed with the area: `(frontend) …`, `(backend) …`, `(imageservice) …`, `(both) …`.
- Branch from `main`. `origin` is `github.com:ed-khalid/visual-rater`. The `frontend`, `backend`, and `imageservice` remotes are leftovers from the merge; don't push to them.
- Don't add secrets to `application.yml`. Use environment variables.

## Known quirks

- `imageservice/Dockerfile` exposes port 7191, but the backend config expects 7011.
- `backend/bin/` is untracked IDE build output.
