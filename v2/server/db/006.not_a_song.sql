-- "Not a song" (skits, spoken intros, interludes, hidden tracks…) replaces exclude_from_artist_score, which nothing set
-- (all false). Such a track counts for nothing: not its artist's score, nor its album's average and track count.
alter table music_tracks rename column exclude_from_artist_score to not_a_song;

-- Album: the average of its rated songs (null if none are rated); not-a-song tracks left out of everything.
create or replace view music_album_scores as
  select a.id as album_id, avg(t.score) as score, count(t.score) as rated_tracks, count(t.id) as tracks
  from music_albums a left join music_tracks t on t.album_id = a.id and not t.not_a_song
  group by a.id;

-- Tracks named as skits are marked (the app does the same for new ones: src/shared/names.ts, isSkit).
update music_tracks set not_a_song = true where name ~* '\mskits?\M';
