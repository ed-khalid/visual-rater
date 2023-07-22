DROP FUNCTION IF EXISTS get_other_artists_comparison_songs(songId uuid, excludedArtistId uuid);
CREATE OR REPLACE FUNCTION get_other_artists_comparison_songs(songId uuid, excludedArtistId uuid)
RETURNS TABLE(score double precision, song_name varchar(100), artist_name varchar(100), album_name varchar(100), album_thumbnail varchar(100))
LANGUAGE plpgsql
AS $$
    BEGIN
    RETURN QUERY SELECT s.score, s.name, a.name, alb.name, alb.thumbnail from generate_series(0,5,0.5) indexScore
    CROSS JOIN LATERAL  (SELECT s.score, s.name, s.artist_id, s.album_id from Song s where s.score = indexScore and s.id != songId LIMIT 1) s
    INNER JOIN artist a on a.id = s.artist_id
    INNER JOIN album alb on alb.id = s.album_id
    where a.id != excludedArtistId
    order by s.score
    LIMIT 100;
    END
$$;

DROP FUNCTION IF EXISTS get_artist_comparison_songs(songId uuid, artistId uuid, excludedAlbumId uuid);
CREATE OR REPLACE FUNCTION get_artist_comparison_songs(songId uuid, artistId uuid, excludedAlbumId uuid)
  RETURNS TABLE(score double precision, song_name varchar(100), artist_name varchar(100), album_name varchar(100), album_thumbnail varchar(100))
  LANGUAGE plpgsql
AS $begin$
        BEGIN
RETURN QUERY SELECT s.score, s.name, a.name, alb.name, alb.thumbnail from generate_series(0,5,0.05) indexScore
                                                                 CROSS JOIN LATERAL  (SELECT s.score, s.name, s.artist_id, s.album_id from Song s where s.score = indexScore and s.id != songId LIMIT 1) s
                                                                 INNER JOIN artist a on a.id = s.artist_id
                                                                 INNER JOIN album alb on alb.id = s.album_id
where a.id = artistId  and alb.id != excludedAlbumId
order by s.score
LIMIT 100;
END
$begin$;
