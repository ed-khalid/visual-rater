DO $$
    DECLARE artist_id$ uuid;
        BEGIN
        SELECT id from artist where name = 'Britney Spears' INTO artist_id$;
        DELETE from song where artist_id = artist_id$;
        DELETE from album where artist_id = artist_id$;
        DELETE from artist where id = artist_id$;
    end;
$$