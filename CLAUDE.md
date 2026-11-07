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

v2 doesn't use any of that. Its own API server (`v2/server/`) holds the Spotify secret for lookups and saves everything to its own Postgres database, `visual_rater_v2`.

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

- **Layout:** `src/scene/` is the 3D workspace (`Stage`, the axis "tree", fruit `Items`, `CoverSphere` shader). `src/hud/` holds the DOM overlays: corner HUD, staging list, catalog, type picker, ADD palette, album popup, hover card, trash icon. `src/state/` has the zustand store and pure layout logic. `src/shared/` has types shared with the server.
- **Data model:** no generic items or boards. Each type (MUSIC, MOVIES, BOOKS; constants in `src/shared/model.ts`) is one tree, built from that type's own collections: `artists`, `albums` and `tracks` for music, and `movies` and `books`. Anything rated directly (tracks, movies, books) carries its own `score` (0–100, undefined = unrated), its `branch` on the tree (`angle`, `length`, `ring`), `since` and `hidden`. What each tree shows is worked out in `src/state/board.ts`, never stored: fruit = rateables with a branch that aren't hidden; the staging tray (`hud/StagedList.tsx`, a DOM list under the + key: cover, artist, name; hidden in album view) = albums without `addedAt` (drag one onto the trunk, within 70px of it on screen, to put its tracks on the tree and open album view; a tap opens its tracklist); the catalog (`hud/Catalog.tsx`, a DOM column in the bottom-right corner, MUSIC only) = every album in the database under its artist, on the tree or staged (staged ones dim; click one for its tracklist; each artist collapses; albums by year or by score; albums show their score, artists their score and letter grade on a chip in the grade's colour); the rater contents (`hud/RaterContents.tsx`, pinned under the bottom of the trunk, every type) = what is on the tree now: its item count and, on MUSIC, its albums grouped under their artist's name (facing albums light up as you orbit); click a cover to take that album off the tree for now or bring it back, or an artist's name for all of theirs (`view.hiddenAlbums`: their branches draw back into the trunk, nothing is saved); in the catalog, click an album for album view (`view.albumView`: every other album's branches and fruit draw back into the trunk, the camera turns to 45° short of face-on, so its branches run out to the right and towards you, and slides the picture right with a view offset; `hud/AlbumView.tsx` fills the left half with its title card (cover, names and year, grade beside score) and the details panel docked below (each song's tier chip, and `hud/AlbumChart.tsx`, FLOW: scores by track number as a line that draws itself in left to right when the album opens), title only on phones; leaving it glides the camera home, as the reset button does), click it again to leave; a click on empty space (with nothing open) or Esc leaves album view. No hover behaviour there for now. ADD on MUSIC offers albums (with their artist) and artists: picking an artist opens a checklist of their albums beside the palette (`hud/ArtistAlbums.tsx`; one per album, oldest first; ones already in the catalog show where they are, another edition of one is marked IN CATALOG and left out of All) and ADD stages the ticked ones at once; a typed entry is a track with no album on MUSIC, a movie or book elsewhere. The trash icon hides a track (score kept), deletes a movie or book, or deletes an album with its tracks (and its artist if nothing else of theirs is left); artists can't be removed directly. Every track on an album is its own record, on the tree or not. Ids are always our own UUIDs; a Spotify id is only `vendor`, optional. Match catalogue picks by vendor id, never by name. Rank is the order of scores, and the gaps between them mean something.
- **Scoring:** 0 (bottom of the trunk) to 100 (top). Dragging fruit sets its `score` (`positionToScore`); held on one score for a moment mid-drag, a card beside it fades in with the songs already rated there, or nearest within 2 points (`board.sameScore`, `hud/ScoreMatches.tsx`); unrated fruit sits mid-trunk, dim and tagged UNRATED, and counts for nothing until dragged. Dropping a staged album on the trunk puts its tracks on unrated and opens album view on it (that's where they get rated; `enterAlbumView` in `hud/Catalog.tsx`). A typed entry starts active rating: everything else on the scene fades (fruit, stems, labels, staged albums; the batch's album and artist stay bright) until each of the batch has a score, Esc, or the tree closes (`board.ratingFocus`, `view.rating`, `hud/RatingWatch.tsx`); it's view state, never saved. Album and artist scores are never stored or dragged: they're worked out from their tracks (`src/state/scores.ts`) with the v1 formulas. Album = average of rated tracks; artist = weighted count of rated tracks in the top tiers (95+ → 6, 90+ → 4, 85+ → 2, 80+ → 1, 70+ → 0.5, 65+ → 0.1; open-ended, shown to one decimal), skipping `excludeFromArtistScore` tracks; hidden tracks still count. The database views `music_album_scores` and `music_artist_scores` use the same formulas. Anything beyond this (tiers, letter grades, bands) is undecided, so raise it with the user before building it.
- **Persistence:** Postgres. The schema is numbered SQL in `server/db/NNN.description.sql`, applied automatically at server startup and recorded in `schema_migrations`. Add new ones as the next number; never edit an applied one. Tables: `music_artists`, `music_albums` (`staged_at`, `added_at`), `music_tracks` (links to album/artist, `score`, `tree_*` branch, `hidden`, `exclude_from_artist_score`), `movies`, `books`, plus the two score views. Album → artist and track → album/artist links are checked at commit; deleting an album deletes its tracks. **`npm run dev` runs the API under `tsx watch`, so editing any server file restarts it and applies new migrations to the real database immediately.** Stop the API before writing a migration, and dry-run it on a copy of the data first: a throwaway schema (`server/repo.test.ts` shows how), the migrations up to the previous one, a copy of the real rows, then the new one. The schema was squashed into `001.schema.sql` on 2026-11-06; older migrations are in git history only.
- **Saving:** the zustand store holds the state in memory and has all the logic. `src/state/remote.ts` loads everything from `GET /api/state` at startup; after each change it diffs each collection against the last saved state (`src/shared/sync.ts`) and sends upserts and deletes to `POST /api/sync`, debounced and retried. The server validates every batch (`server/schema.ts`) and applies it in one transaction (`server/repo.ts`). Only the open type is kept in the browser (localStorage `visual-rater-v2.ui`). Entity types shared by the app and the server live in `src/shared/model.ts`; components read the collections with `usePersisted()` (a shallow-compared selector), because a zustand selector that builds a new object every time re-renders forever.
- **Glow colours:** `colors[0]` on an album, artist, track, movie or book stores the raw dominant colour of its image, worked out once in the browser (`src/scene/color.ts`, `useGlow`) and saved. The glow is derived from it at render time with `glowColor()`, so change the look there; never store adjusted colours.
- **Layout rules:** each piece of fruit hangs on its own horizontal branch of the trunk. A branch is chosen when the fruit first goes on the tree (`chooseBranch`, at least 60° from neighbours at a similar height) and stored on it, so moving one never moves another. Fruit can be dragged up or down (changes its score) and sideways (changes stem length). After any drag that changes a score, `autoAlign` re-lays out the tree, adjusting stem lengths to stop fruit touching. An album's unrated tracks (all mid-trunk) go outwards in tracklist order, track 1 on the shortest stem (`autoAlign`'s `chains`), a fruit's width apart, or evenly closer if that's what it takes to fit them all. On MUSIC, with more than one album on the tree, every track of an album points the same way: the albums spread evenly round the whole turn (`groupDirections`; two albums straight left and right, three 120° apart), in the order they went on the tree. A lone album uses both sides of the main plane. Adding or removing an album on the tree re-lays it out too. The reset button (`flattenBoard`) also re-lays out the tree onto the main plane only, each album wholly left or wholly right (whichever side has fewer tracks so far); the next score drag spreads the albums round again. Elsewhere, as many fruit as possible sit on the main plane; stems are capped at `ALIGN_MAX_LENGTH`, and past that fruit swings to a plane 30°, then 60°, off it. The camera only orbits the vertical axis, so "up" always means "better".
- **API (`server/`):** `GET /api/suggestions/:typeId?q=` (only `music`: Spotify artists and albums, merged by name match), `GET /api/music/albums/:id` (album with full tracklist), `GET /api/music/artists/:id/albums` (an artist's albums, one per album across editions: `distinctAlbums`), `GET /api/state` and `POST /api/sync` (saving). Validate ids and bodies before calling Spotify or the database. Album and track names from Spotify are saved without edition tags (`src/shared/names.ts`: a trailing (…), […] or " - …" naming a remaster, deluxe, expanded, anniversary or similar edition; live, remix, acoustic, radio edit and feat. stay); a suggestion keeps the removed tag as `edition`, shown dim in the ADD palette only.
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
