
DROP FUNCTION IF EXISTS recalculate CASCADE;
CREATE FUNCTION recalculate()
  RETURNS TRIGGER
  LANGUAGE plpgsql
AS $$
DECLARE album_score double precision;
DECLARE artist_score double precision;
BEGIN
        select avg(score) from SONG s where s.album_id = NEW.album_id INTO album_score;
        UPDATE album SET score = album_score WHERE id = NEW.album_id;
        select avg(score) from album a where a.artist_id = NEW.artist_id INTO artist_score;
        UPDATE artist SET score = artist_score WHERE id = NEW.artist_id;
        RETURN NULL;
    END;
$$;

CREATE TRIGGER trigger_recalc
    AFTER INSERT OR UPDATE
    ON song
    FOR EACH ROW
    EXECUTE PROCEDURE recalculate()
