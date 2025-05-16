DROP TABLE IF EXISTS genre;
CREATE TABLE genre (
    id serial primary key,
    name varchar(40) NOT NULL UNIQUE
);
INSERT INTO genre (name) values
    ('Heavy Metal'),
    ('Thrash Metal'),
    ( 'Alternative Rock'),
    ( 'Grunge'),
    ( 'Pop'),
    ( 'Teen Pop'),
    ( 'Teen Group'),
    ( 'Classic Rock'),
    ( 'Hard Rock'),
    ( 'Latmiya'),
    ( 'Arabic Pop'),
( 'NOT CHOSEN')
    ;

ALTER TABLE artist ADD COLUMN primary_genre_id INT;
ALTER TABLE artist ADD CONSTRAINT fk_artist_primary_genre FOREIGN KEY (primary_genre_id) REFERENCES genre(id) ON DELETE RESTRICT;

CREATE TABLE artist_secondary_genre (
                                        artist_id UUID NOT NULL,
                                        genre_id INT NOT NULL,
                                        PRIMARY KEY (artist_id, genre_id),
                                        FOREIGN KEY (artist_id) REFERENCES artist(id) ON DELETE CASCADE,
                                        FOREIGN KEY (genre_id) REFERENCES genre(id) ON DELETE CASCADE
);


ALTER TABLE album ADD COLUMN primary_genre_id INT;
ALTER TABLE album ADD CONSTRAINT fk_album_primary_genre FOREIGN KEY (primary_genre_id) REFERENCES genre(id) ON DELETE RESTRICT;

ALTER TABLE song ADD COLUMN primary_genre_id INT;
ALTER TABLE song ADD CONSTRAINT fk_song_primary_genre FOREIGN KEY (primary_genre_id) REFERENCES genre(id) ON DELETE RESTRICT;
CREATE TABLE album_secondary_genre (
                                        album_id UUID NOT NULL,
                                        genre_id INT NOT NULL,
                                        PRIMARY KEY (album_id, genre_id),
                                        FOREIGN KEY (album_id) REFERENCES album(id) ON DELETE CASCADE,
                                        FOREIGN KEY (genre_id) REFERENCES genre(id) ON DELETE CASCADE
);
CREATE TABLE song_secondary_genre (
                                       song_id UUID NOT NULL,
                                       genre_id INT NOT NULL,
                                       PRIMARY KEY (song_id, genre_id),
                                       FOREIGN KEY (song_id) REFERENCES song(id) ON DELETE CASCADE,
                                       FOREIGN KEY (genre_id) REFERENCES genre(id) ON DELETE CASCADE
);
