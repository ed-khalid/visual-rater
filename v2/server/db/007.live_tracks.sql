-- Live recordings of songs the artist already has: rated, and counted for their album, but not for the artist (so a
-- song doesn't count twice). Covers and songs that only exist live aren't marked, so they still count.
alter table music_tracks add column live boolean not null default false;

-- Artist: as in 005 (points by song tier as shown), leaving out live recordings too.
create or replace view music_artist_scores as
  select ar.id as artist_id,
         round(sum(case when t.shown >= 94 then 6 when t.shown >= 90 then 4 when t.shown >= 80 then 1
                        when t.shown >= 75 then 0.5 when t.shown >= 70 then 0.1 else 0 end)
               filter (where t.score is not null and not t.not_a_song and not t.live)::numeric, 1) as score,
         count(t.score) filter (where not t.not_a_song and not t.live) as rated_tracks
  from music_artists ar
  left join (select *, round((score / 2)::numeric) * 2 as shown from music_tracks) t on t.artist_id = ar.id
  group by ar.id;

-- The tracks already saved, as the app marks new ones (src/state/live.ts, src/shared/names.ts looksLive and songKey):
-- a track that looks live (a live tag at the end of its name, or an album named as a live one) whose name, without
-- the tag, matches a studio track of the same artist on another album.
with k as (
  select t.id, t.artist_id, t.album_id, t.not_a_song,
         (t.name ~* '(\s+-\s+[^-]*\mlive\M.*|\s*[(\[][^)\]]*\mlive\M[^)\]]*[)\]])\s*$'
          or coalesce(al.name, '') ~* '\munplugged\M|\mlive (at|in|from|on)\M|[(\[]live\M|\min concert\M') as looks_live,
         regexp_replace(lower(regexp_replace(t.name, '(\s+-\s+[^-]*\mlive\M.*|\s*[(\[][^)\]]*\mlive\M[^)\]]*[)\]])\s*$', '', 'i')),
                        '[^a-z0-9]', '', 'g') as key
  from music_tracks t left join music_albums al on al.id = t.album_id
  where t.artist_id is not null)
update music_tracks set live = true
where id in (select l.id from k l where l.looks_live and not l.not_a_song
             and exists (select 1 from k s where s.artist_id = l.artist_id and s.album_id is distinct from l.album_id
                         and not s.looks_live and not s.not_a_song and s.key = l.key));
