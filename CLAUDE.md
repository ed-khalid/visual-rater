# Visual Rater

A personal rating app whose point is the *rating interaction itself*: visual, drag-driven raters instead of star or number inputs. v1 (`frontend/`, `backend/`, `imageservice/`) rates music. v2 (`v2/`) is a from-scratch minimalist rebuild: a 3D workspace for ranking any type of item, with music first.

Project notes, status, and Progress History are kept outside this repo in `~/projects/04-todo/code-visual-rater/AGENTS.md`. If that folder has moved, look in the other status folders under `~/projects/`. Record design decisions and progress there, not here.

## Layout

This is a monorepo built from three formerly separate repos. Each history was rewritten into a subfolder (see `~/code/create-visual-rater-monorepo.sh`).

| Folder | Stack | Port |
|---|---|---|
| `frontend/` | React 19, TypeScript, Vite, Apollo Client, D3 7, dnd-kit, motion | 3000 |
| `backend/` | Kotlin, Spring Boot 3.4 (spring-graphql, JPA/Hibernate), Arrow, Postgres | 9000 |
| `imageservice/` | Python, FastAPI: dominant colors and image similarity for cover art | 7011 |
| `v2/` | React 19, TypeScript, Vite 8, react-three-fiber + drei + postprocessing, zustand, cmdk; small Hono API server in `v2/server/` | 3001 (app), 3002 (API) |

v1 request flow: frontend → GraphQL (HTTP for queries and mutations, WebSocket for subscriptions) at `localhost:9000/graphql` → backend → Postgres, Spotify Web API, imageservice.

v2 doesn't use any of that. Its own API server (`v2/server/`) holds the Spotify secret for lookups and saves boards and items to its own Postgres database, `visual_rater_v2`.

## Running locally

1. **Postgres:** database `visual_rater`, user `visual_rater_app`, on `localhost:5432`.
2. **imageservice:** `cd imageservice && .venv/bin/python main.py` (listens on 7011).
3. **backend:** `cd backend && ./gradlew bootRun`. Set `VISUAL_RATER_DATABASE_PW` and `VISUAL_RATER_SPOTIFY_CLIENT_SECRET` in the environment.
4. **frontend:** `cd frontend && npm install && npm start`. The backend URL is hardcoded in `src/setupApollo.ts`.

v2 runs on its own: `cd v2 && npm install && npm run dev` starts the app (3001) and the API server (3002) together. `npm run dev:web` and `npm run dev:api` start them separately. The API needs:
- **Postgres database `visual_rater_v2`**, owned by `visual_rater_app` (create it once: `sudo -u postgres createdb -O visual_rater_app visual_rater_v2`). The server connects with `VISUAL_RATER_DATABASE_PW`, the same variable v1 uses, or `V2_DATABASE_URL` to override. Without a database, the app shows CAN'T REACH THE SERVER.
- `VISUAL_RATER_SPOTIFY_CLIENT_SECRET` (shared with v1); without it, music suggestions are off.

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

## v2

- **Layout:** `src/scene/` is the 3D workspace (`Stage`, the axis "tree", fruit `Items`, floating `StagingArea`, `CoverSphere` shader). `src/hud/` holds the DOM overlays: corner HUD, type picker, ADD palette, album popup, hover card, trash icon. `src/state/` has the zustand store and pure layout logic. `src/shared/` has types shared with the server.
- **Data model:** `ItemType` → `Board` (one per type) → `Item`. An item is *staged* (waiting in the tray on the left), *placed* (a `Placement` with a continuous `position` from 0 at the bottom to 1 at the top), or, for an album whose tracks have been put on the tree with its + icon, *added* (floating in the column on the right). Each of those tracks is its own placed item, with `albumId` pointing back to the album. Rank is the order of positions, and the gaps between them mean something.
- **Scoring:** scores run from 0 (bottom of the trunk) to 100 (top), calculated from the stored position with `positionToScore` in `src/state/store.ts`, and shown as whole numbers (`formatScore`). Staged items read UNRATED. The trunk has a 0–100 scale beside its ticks, and the score shows on hover and live while dragging. Anything beyond the linear 0–100 scale (tiers, bands, snapping) is still undecided, so raise it with the user before building it.
- **Persistence:** Postgres. The schema is numbered SQL in `server/db/NNN.description.sql`, applied automatically at server startup and recorded in `schema_migrations`. Add new ones as the next number; never edit an applied one. Tables: `item_types`, `boards`, `items` (albums keep their tracklist as JSON), and `board_items`, one row per item on a board with `status` staged / added / placed, plus position and branch when placed.
- **Saving:** the zustand store holds the state in memory and has all the logic. `src/state/remote.ts` loads everything from `GET /api/state` at startup; after each change it diffs against the last saved state (`src/shared/sync.ts`) and sends upserts and deletes to `POST /api/sync`, debounced and retried. The server validates every batch (`server/schema.ts`) and applies it in one transaction (`server/repo.ts`). Only the open board is kept in the browser (localStorage `visual-rater-v2.ui`). Data from before the database existed (localStorage `visual-rater-v2`) is imported once, into an empty database, through `migrateState`, and kept afterwards as `visual-rater-v2.imported-backup`. Entity types shared by the app and the server live in `src/shared/model.ts`.
- **Glow colours:** `items.colors[0]` stores the raw dominant colour of the item's cover, worked out once in the browser (`src/scene/color.ts`, `useGlow`) and saved. The glow is derived from it at render time with `glowColor()`, so change the look there; never store adjusted colours.
- **Layout rules:** each item hangs on its own horizontal branch of the axis. Each placement stores its branch (`angle`, `length`, `ring`); new items get one from `chooseBranch` that keeps them at least 60° from neighbours at a similar height. Fruit can be dragged up or down (changes `position`) and sideways (changes stem length). After any drag that changes a height, `autoAlign` re-lays out the board so as many items as possible sit on the main plane (left and right of the trunk, as seen from the starting view), adjusting stem lengths to stop fruit touching. Stems are capped at `ALIGN_MAX_LENGTH`; past that, an item swings to a plane 30°, then 60°, off the main one. The camera only orbits the vertical axis, so "up" always means "better".
- **API (`server/`):** `GET /api/suggestions/:typeId?q=` (only `music`: Spotify artists and albums, merged by name match), `GET /api/music/albums/:id` (album with full tracklist), `GET /api/state` and `POST /api/sync` (saving). Validate ids and bodies before calling Spotify or the database.
- **UI tenet:** minimalist. No forms or panels; everything is a gesture on the scene or goes through the ADD palette. Don't add hint text the user didn't ask for. Keep touch targets around 44px, and inputs at 16px or more so iOS doesn't zoom.
- **Checks:** `npm run typecheck`, `npm test` (vitest; covers store, layout, sync, server). The repository tests run against a real Postgres when `V2_TEST_DATABASE_URL` is set (e.g. to `visual_rater_v2`); they work inside a throwaway schema and drop it afterwards. To run an API against a throwaway schema, set `V2_DATABASE_SCHEMA`. Never point tests at the real tables: the one-time import only runs into an empty database. Check visual changes in a browser on desktop and a phone-sized viewport.
- `v2/.npmrc` sets `legacy-peer-deps=true`. npm 11 crashes ("reading edgesOut") resolving vitest's optional peer dependencies; every real peer is an explicit dependency, so this is safe.

## Data model (v1)

- Every v1 rater writes the same thing: a single numeric `score` per song, from 0 to 100. The tier thresholds are in `backend/db/04.song_score_update.sql` and `frontend/src/models/ScoreModels.ts`. Artist and album scores are calculated from song scores by database triggers.
- DB migrations are hand-numbered SQL in `backend/db/NN.description.sql` and applied manually. Add new ones as the next number; don't edit applied files. Hibernate `ddl-auto: update` also runs, so check that entity changes and migrations agree.
- `backend/backup.sql` is a data snapshot, not a migration.
- Full DB backup (schema, data, functions, triggers) taken 2026-11-03, before a possible rework: `~/projects/04-todo/code-visual-rater/db-backups/visual_rater-20261103-0731.dump` (restore with `pg_restore`), plus a plain-SQL copy `visual_rater-20261103-0731.sql` in the same folder. It doesn't include the `visual_rater_app` role; create that first. If the project folder moves to another status folder under `~/projects/`, the backups move with it.

## Conventions

- Commit messages are prefixed with the area: `(frontend) …`, `(backend) …`, `(imageservice) …`, `(both) …`, `(v2) …`.
- Branch from `main`. `origin` is `github.com:ed-khalid/visual-rater`. The `frontend`, `backend`, and `imageservice` remotes are leftovers from the merge; don't push to them.
- Don't add secrets to `application.yml`. Use environment variables.

## Known quirks

- `imageservice/Dockerfile` exposes port 7191, but the backend config expects 7011.
- `backend/bin/` is untracked IDE build output.
- `frontend/README.md` lists tiers on a 1–5 scale, but v1 scores are stored and displayed as 0–100.
