-- Artist scores: each rated song adds its song tier's points on the 0–5 scale (the app's src/shared/scale.ts, FIVE),
-- by its score as shown (rounded to 0.1 = 2 stored points): CLASSIC 4.7+ adds 6, GREAT 4.5+ 4, GOOD 4+ 1,
-- PLEASANT 3.75+ 0.5, INTERESTING 3.5+ 0.1, the rest nothing. (Before: by raw score, 95+ 6, 90+ 4, 85+ 2, 80+ 1,
-- 70+ 0.5, 65+ 0.1.) src/state/scores.ts, artistWeight, does the same: change both together.
create or replace view music_artist_scores as
  select ar.id as artist_id,
         round(sum(case when t.shown >= 94 then 6 when t.shown >= 90 then 4 when t.shown >= 80 then 1
                        when t.shown >= 75 then 0.5 when t.shown >= 70 then 0.1 else 0 end)
               filter (where t.score is not null and not t.exclude_from_artist_score)::numeric, 1) as score,
         count(t.score) filter (where not t.exclude_from_artist_score) as rated_tracks
  from music_artists ar
  left join (select *, round((score / 2)::numeric) * 2 as shown from music_tracks) t on t.artist_id = ar.id
  group by ar.id;
