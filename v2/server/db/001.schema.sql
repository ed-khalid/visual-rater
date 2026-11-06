-- v2 schema. Applied automatically by the API server at startup (server/migrate.ts), once, in order.
-- Add changes as the next number (002.…sql); never edit a migration that has been applied.
--
-- There's no generic "item" or "board": each type (MUSIC, MOVIES, BOOKS) is one tree, built from its own tables.
-- Anything rated directly (tracks, movies, books) carries its own score (0–100, null = unrated) and its branch on
-- the tree (tree_*: set when it first goes on the tree; hidden = taken off it, score kept). What each tree shows is
-- worked out by the app (src/state/board.ts), never stored. Album and artist scores are views over their tracks.
--
-- Ids are always our own. An outside catalogue's id (Spotify's, for now) is vendor + vendor_id, optional, unique
-- per table, so things that aren't in any catalogue work the same way. colors[1] is the raw dominant colour of the
-- image ('#rrggbb'); the app derives the glow from it.

-- ── Music ────────────────────────────────────────────────────────────────────────────────────────────────────

create table music_artists (
  id         uuid primary key,
  name       text not null,
  image      text,
  colors     text[],
  vendor     text,
  vendor_id  text,
  check ((vendor is null) = (vendor_id is null))
);

create table music_albums (
  id                uuid primary key,
  name              text not null,
  image             text,
  colors            text[],
  vendor            text,
  vendor_id         text,
  artist_id         uuid references music_artists (id) on delete set null deferrable initially deferred,
  year              integer check (year between 0 and 9999),
  -- Whether the tracklist has been fetched (or entered), so an album whose tracks were all deleted isn't fetched
  -- again.
  tracklist_loaded  boolean not null default false,
  -- When it was added (it waits in the staging tray), and when its tracks were put on the tree.
  staged_at         bigint not null,
  added_at          bigint,
  check ((vendor is null) = (vendor_id is null))
);

-- What's rated on the MUSIC tree. An album's tracklist is its tracks in disc then number order; a typed track has
-- no album.
create table music_tracks (
  id                         uuid primary key,
  name                       text not null,
  image                      text,
  colors                     text[],
  vendor                     text,
  vendor_id                  text,
  album_id                   uuid references music_albums (id) on delete cascade deferrable initially deferred,
  artist_id                  uuid references music_artists (id) on delete set null deferrable initially deferred,
  disc                       integer check (disc >= 0),
  number                     integer check (number >= 0),
  duration_ms                integer check (duration_ms >= 0),
  -- Left out of its artist's score (interludes, skits, live versions…).
  exclude_from_artist_score  boolean not null default false,
  score                      double precision check (score between 0 and 100),
  tree_angle                 double precision,
  tree_length                double precision check (tree_length > 0),
  tree_ring                  integer check (tree_ring >= 0),
  tree_since                 bigint,
  hidden                     boolean not null default false,
  check ((vendor is null) = (vendor_id is null)),
  check ((tree_angle is null) = (tree_length is null) and (tree_length is null) = (tree_ring is null))
);

create unique index music_artists_vendor on music_artists (vendor, vendor_id);
create unique index music_albums_vendor on music_albums (vendor, vendor_id);
create index music_albums_artist_id on music_albums (artist_id);
create unique index music_tracks_vendor on music_tracks (vendor, vendor_id);
create index music_tracks_album_id on music_tracks (album_id);
create index music_tracks_artist_id on music_tracks (artist_id);

-- Album and artist scores, with the v1 formulas (the app's src/state/scores.ts does the same).

-- Album: the average of its rated tracks (null if none are rated).
create view music_album_scores as
  select a.id as album_id, avg(t.score) as score, count(t.score) as rated_tracks, count(t.id) as tracks
  from music_albums a left join music_tracks t on t.album_id = a.id
  group by a.id;

-- Artist: a weighted count of their rated tracks in the top tiers (no upper limit; null if none are rated).
create view music_artist_scores as
  select ar.id as artist_id,
         round(sum(case when t.score >= 95 then 6 when t.score >= 90 then 4 when t.score >= 85 then 2
                        when t.score >= 80 then 1 when t.score >= 70 then 0.5 when t.score >= 65 then 0.1 else 0 end)
               filter (where t.score is not null and not t.exclude_from_artist_score)::numeric, 1) as score,
         count(t.score) filter (where not t.exclude_from_artist_score) as rated_tracks
  from music_artists ar left join music_tracks t on t.artist_id = ar.id
  group by ar.id;

-- ── Movies and books: rated directly, nothing else attached (yet) ───────────────────────────────────────────

create table movies (
  id           uuid primary key,
  name         text not null,
  image        text,
  colors       text[],
  score        double precision check (score between 0 and 100),
  tree_angle   double precision,
  tree_length  double precision check (tree_length > 0),
  tree_ring    integer check (tree_ring >= 0),
  tree_since   bigint,
  hidden       boolean not null default false,
  check ((tree_angle is null) = (tree_length is null) and (tree_length is null) = (tree_ring is null))
);

create table books (like movies including all);
