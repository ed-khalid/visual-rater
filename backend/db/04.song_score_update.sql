DROP FUNCTION IF EXISTS recalculate_artist_song_metadata CASCADE;
create function recalculate_artist_song_metadata() returns trigger
    language plpgsql
as
$$
DECLARE album_score double precision;
    DECLARE artist_score double precision;
    DECLARE artist_id$ uuid;
    DECLARE album_id$ uuid;

    DECLARE classic$ int;
    DECLARE great$ int;
    DECLARE verygood$ int;
    DECLARE good$ int;
    DECLARE pleasant$ int;
    DECLARE decent$ int;
    DECLARE interesting$ int;
    DECLARE ok$ int;
    DECLARE average$ int;
    DECLARE meh$ int;
    DECLARE boring$ int;
    DECLARE poor$ int;
    DECLARE bad$ int;
    DECLARE offensive$ int;
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
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 95 and s.exclude_from_artist_rating is null INTO classic$ ;
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 90 and s.score < 95 and s.exclude_from_artist_rating is null INTO great$ ;
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 85 and s.score < 90 and s.exclude_from_artist_rating is null INTO verygood$ ;
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 80 and s.score < 85 and s.exclude_from_artist_rating is null INTO good$ ;
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 75 and s.score < 80 and s.exclude_from_artist_rating is null INTO pleasant$ ;
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 70 and s.score < 75 and s.exclude_from_artist_rating is null INTO decent$ ;
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 65 and s.score < 70 and s.exclude_from_artist_rating is null INTO interesting$ ;
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 60 and s.score < 65 and s.exclude_from_artist_rating is null INTO ok$ ;
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 55 and s.score < 60 and s.exclude_from_artist_rating is null INTO meh$ ;
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 50 and s.score < 55 and s.exclude_from_artist_rating is null INTO average$ ;
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 40 and s.score < 50 and s.exclude_from_artist_rating is null INTO boring$ ;
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 30 and s.score < 40 and s.exclude_from_artist_rating is null INTO poor$ ;
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 10 and s.score < 30 and s.exclude_from_artist_rating is null INTO bad$ ;
    select count(*) from song s where s.artist_id = artist_id$ and s.score >= 0 and s.score < 10  and s.exclude_from_artist_rating is null INTO offensive$ ;
    select count(*) from song s where s.artist_id = artist_id$ INTO total$;
    update artist_metadata
    set total_songs = total$,
        offensive = offensive$,
        bad = bad$,
        poor = poor$,
        average = average$,
        meh = meh$,
        ok = ok$,
        interesting = interesting$,
        decent = decent$,
        pleasant = pleasant$,
        good = good$,
        verygood = verygood$,
        great= great$,
        classic = classic$
    where id =(select metadata_id from artist where artist.id = artist_id$)
    ;
    select (6*classic$ + 4*great$ + 2*verygood$ + 1*good$ + 0.5 * decent$ + 0.5* pleasant$ + 0.1*interesting$) INTO artist_score;
    UPDATE artist SET score = artist_score WHERE id = artist_id$;
    RETURN NULL;
END
$$;

alter function recalculate_artist_song_metadata() owner to visual_rater_app;




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
        update artist_metadata set total_albums = (select count(*) from album a WHERE a.artist_id = NEW.artist_id) where id = (select metadata_id from artist where id = NEW.artist_id);
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
