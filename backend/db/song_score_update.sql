DROP FUNCTION IF EXISTS recalculate_artist_song_metadata CASCADE;
CREATE FUNCTION recalculate_artist_song_metadata()
  RETURNS TRIGGER
  LANGUAGE plpgsql
AS $rec$
DECLARE album_score double precision;
DECLARE artist_score double precision;
DECLARE artist_id$ uuid;
DECLARE album_id$ uuid;
DECLARE classic$ int;
DECLARE great$ int;
DECLARE good$ int;
DECLARE mediocre$ int;
DECLARE bad$ int;
DECLARE terrible$ int;
DECLARE total$ int;
BEGIN
        IF (TG_op = 'DELETE') THEN
            artist_id$ := OLD.artist_id;
            album_id$ := OLD.album_id;
            else
            artist_id$ := NEW.artist_id;
            album_id$ := NEW.album_id;
        end if;
        select avg(score) from SONG s where s.album_id = album_id$ INTO album_score;
        UPDATE album SET score = album_score WHERE id = album_id$;
        select avg(score) from album a where a.artist_id = artist_id$ INTO artist_score;
        UPDATE artist SET score = artist_score WHERE id = artist_id$;
        select count(*) from song s where s.artist_id = artist_id$ and s.score >= 4.25 INTO classic$ ;
        select count(*) from song s where s.artist_id = artist_id$ and s.score >= 4 and s.score < 4.25 INTO great$ ;
        select count(*) from song s where s.artist_id = artist_id$ and s.score >= 3.5 and s.score < 4 INTO good$ ;
        select count(*) from song s where s.artist_id = artist_id$ and s.score >= 3 and s.score < 3.5 INTO mediocre$ ;
        select count(*) from song s where s.artist_id = artist_id$ and s.score >= 2 and s.score < 3 INTO bad$ ;
        select count(*) from song s where s.artist_id = artist_id$ and s.score < 2 INTO terrible$ ;
        select count(*) from song s where s.artist_id = artist_id$ INTO total$;
        update artist_metadata
          set total_songs = total$,
              bad = bad$,
              good = good$,
              great= great$,
              classic = classic$,
              terrible = terrible$,
              mediocre = mediocre$,
              great_percentage = cast(great$ as float)/nullif(cast(total$ as float), 0),
              good_percentage = cast(good$ as float)/nullif(cast (total$ as float),0),
              mediocre_percentage = cast(mediocre$ as float)/nullif(cast(total$ as float),0),
              bad_percentage = cast(bad$ as float)/nullif( cast (total$ as float),0),
              terrible_percentage = cast (terrible$ as float)/nullif(cast (total$ as float),0),
              classic_percentage = cast(classic$ as float)/nullif(cast (total$ as float),0)
           where id =(select metadata_id from artist where artist.id = artist_id$)
        ;
        RETURN NULL;
    END
$rec$;



DROP FUNCTION IF EXISTS recalculate_tier CASCADE;
CREATE FUNCTION recalculate_tier()
  RETURNS TRIGGER
  LANGUAGE plpgsql
AS $tier$
    BEGIN
        CREATE TEMPORARY TABLE metadata AS
        SELECT m.*
        FROM artist_metadata m
        inner join artist a
        on a.metadata_id = m.id
        WHERE a.id = NEW.artist_id;
        RETURN NULL;
    end;
$tier$;



DROP FUNCTION IF EXISTS recalculate_total_albums CASCADE;
CREATE FUNCTION recalculate_total_albums()
  RETURNS TRIGGER
  LANGUAGE plpgsql
AS $tot_alb$
    BEGIN
        update artist_metadata set total_albums = (select count(*) from album a WHERE a.artist_id = NEW.artist_id) ;
        RETURN NULL;
    end;
$tot_alb$;

CREATE TRIGGER trigger_album_total_recalc
    AFTER INSERT
    ON album
    FOR EACH ROW
    EXECUTE PROCEDURE recalculate_total_albums();

CREATE TRIGGER trigger_recalc_delete
    AFTER DELETE
    on song
    FOR EACH ROW
    EXECUTE PROCEDURE recalculate_artist_song_metadata();


CREATE TRIGGER trigger_recalc
    AFTER INSERT OR UPDATE
    ON song
    FOR EACH ROW
    EXECUTE PROCEDURE recalculate_artist_song_metadata();
