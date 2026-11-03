-- Music gets its own tables: artists, albums and tracks. Each row shares its id with an `items` row (an item that's
-- an album has a row in both), so boards keep pointing at `items` whatever kind of thing is on them. `items` keeps
-- only what every type has. Ids are always our own; an outside catalogue's id (Spotify's, for now) is `vendor` +
-- `vendor_id` on the music row, and is optional, so artists, albums and tracks that aren't on Spotify fit too.
-- Album tracklists stop being JSON: every track on an album is its own item, on the tree or not. Artists stop being
-- text: every album and track points at an artist item.

create table music_artists (
  item_id    uuid primary key references items (id) on delete cascade,
  vendor     text,
  vendor_id  text,
  check ((vendor is null) = (vendor_id is null))
);
create unique index music_artists_vendor on music_artists (vendor, vendor_id);

create table music_albums (
  item_id           uuid primary key references items (id) on delete cascade,
  vendor            text,
  vendor_id         text,
  artist_id         uuid references music_artists (item_id) on delete set null deferrable initially deferred,
  year              integer check (year between 0 and 9999),
  -- Whether the tracklist has been fetched (or entered). Kept separately so an album whose tracks were all deleted
  -- isn't fetched again.
  tracklist_loaded  boolean not null default false,
  check ((vendor is null) = (vendor_id is null))
);
create unique index music_albums_vendor on music_albums (vendor, vendor_id);
create index music_albums_artist_id on music_albums (artist_id);

create table music_tracks (
  item_id      uuid primary key references items (id) on delete cascade,
  vendor       text,
  vendor_id    text,
  album_id     uuid references music_albums (item_id) on delete set null deferrable initially deferred,
  artist_id    uuid references music_artists (item_id) on delete set null deferrable initially deferred,
  disc         integer check (disc >= 0),
  number       integer check (number >= 0),
  duration_ms  integer check (duration_ms >= 0),
  check ((vendor is null) = (vendor_id is null))
);
create unique index music_tracks_vendor on music_tracks (vendor, vendor_id);
create index music_tracks_album_id on music_tracks (album_id);
create index music_tracks_artist_id on music_tracks (artist_id);

-- 1. The same catalogue entry saved more than once: keep one (preferring one that's on a board) and point
--    everything at it.
create temporary table dup_items on commit drop as
with ranked as (
  select i.id, first_value(i.id) over (
           partition by i.source_provider, i.source_kind, i.source_id
           order by exists (select 1 from board_items b where b.item_id = i.id) desc, i.id) as keep
  from items i
  where i.source_id is not null
)
select id as dup, keep from ranked where id <> keep;

update items i set album_id = d.keep from dup_items d where i.album_id = d.dup;
delete from board_items b using dup_items d
  where b.item_id = d.dup and exists (select 1 from board_items k where k.board_id = b.board_id and k.item_id = d.keep);
update board_items b set item_id = d.keep from dup_items d where b.item_id = d.dup;
delete from items i using dup_items d where i.id = d.dup;

-- 2. Artists, albums and tracks that already exist as items.
insert into music_artists (item_id, vendor, vendor_id)
  select id, source_provider, source_id from items where source_kind = 'artist';

insert into music_albums (item_id, vendor, vendor_id, year, tracklist_loaded)
  select id, source_provider, source_id, year, tracks is not null
  from items where source_kind = 'album' or tracks is not null;

insert into music_tracks (item_id, vendor, vendor_id, album_id, disc, number, duration_ms)
  select i.id, i.source_provider, i.source_id, ma.item_id, t.disc, t.number, t.duration_ms
  from items i
  left join music_albums ma on ma.item_id = i.album_id
  left join items al on al.id = ma.item_id
  -- disc, number and duration come from the album's tracklist entry: same catalogue id, or same name if typed
  left join lateral (
    select (e->>'disc')::int as disc, (e->>'number')::int as number, (e->>'durationMs')::int as duration_ms
    from jsonb_array_elements(al.tracks) e
    where e->>'id' = i.source_id or (i.source_id is null and e->>'name' = i.name)
    limit 1
  ) t on true
  where (i.source_kind = 'track' or i.album_id is not null)
    and not exists (select 1 from music_albums a where a.item_id = i.id);

-- 3. Artist names become artist items: one per name (ignoring case), reusing an artist item with that name if
--    there is one.
create temporary table artist_names on commit drop as
  select distinct on (lower(i.artist)) i.artist as name, i.type_id, null::uuid as id, false as is_new
  from items i
  where i.artist is not null
    and (exists (select 1 from music_albums a where a.item_id = i.id) or exists (select 1 from music_tracks t where t.item_id = i.id))
  order by lower(i.artist), i.artist;

update artist_names n set id = (
  select a.item_id from music_artists a join items ai on ai.id = a.item_id
  where lower(ai.name) = lower(n.name) order by a.vendor is null, a.item_id limit 1);
update artist_names set id = gen_random_uuid(), is_new = true where id is null;

insert into items (id, type_id, name) select id, type_id, name from artist_names where is_new;
insert into music_artists (item_id) select id from artist_names where is_new;

update music_albums a set artist_id = n.id from items i, artist_names n
  where i.id = a.item_id and lower(i.artist) = lower(n.name);
update music_tracks t set artist_id = n.id from items i, artist_names n
  where i.id = t.item_id and lower(i.artist) = lower(n.name);
update music_tracks t set artist_id = a.artist_id from music_albums a
  where t.artist_id is null and a.item_id = t.album_id;

-- 4. Tracklist entries that aren't items yet become tracks of their album (not on any board).
create temporary table new_tracks on commit drop as
  select distinct on (al.id, coalesce(e->>'id', e->>'name'))
         gen_random_uuid() as id, al.id as album_id, al.type_id, e->>'name' as name, al.image, al.colors,
         al.source_provider as vendor, case when al.source_provider is not null then e->>'id' end as vendor_id,
         (e->>'disc')::int as disc, (e->>'number')::int as number, (e->>'durationMs')::int as duration_ms
  from items al cross join jsonb_array_elements(al.tracks) e
  where al.tracks is not null
    and not exists (
      select 1 from music_tracks t join items ti on ti.id = t.item_id
      where t.album_id = al.id and (t.vendor_id = e->>'id' or (t.vendor_id is null and ti.name = e->>'name')))
    and not exists (select 1 from music_tracks t where t.vendor = al.source_provider and t.vendor_id = e->>'id')
  order by al.id, coalesce(e->>'id', e->>'name');

insert into items (id, type_id, name, image, colors) select id, type_id, name, image, colors from new_tracks;
insert into music_tracks (item_id, vendor, vendor_id, album_id, artist_id, disc, number, duration_ms)
  select n.id, n.vendor, n.vendor_id, n.album_id, a.artist_id, n.disc, n.number, n.duration_ms
  from new_tracks n join music_albums a on a.item_id = n.album_id;

-- 5. items keeps only what every type has. (Dropping the source columns also drops their check.) The deferred
--    link checks run first: Postgres won't alter a table while they're pending.
set constraints all immediate;
drop index items_album_id;
alter table items
  drop column album_id,
  drop column tracks,
  drop column artist,
  drop column year,
  drop column source_provider,
  drop column source_kind,
  drop column source_id;
