DROP TABLE IF EXISTS artists CASCADE ;

CREATE TABLE artists(
    id serial primary key ,
    name varchar(100) NOT NULL
);

DROP TABLE IF EXISTS albums CASCADE ;
CREATE TABLE albums(
    id serial primary key ,
    name varchar(250) NOT NULL,
    year INTEGER NOT NULL,
    cover
    artist_id INTEGER references artists(id)
);

DROP TABLE IF EXISTS songs CASCADE;
CREATE TABLE songs(
    id serial primary key,
    name varchar(250) NOT NULL,
    artist_id INTEGER references artists(id),
    album_id INTEGER references albums(id),
    score FLOAT
);


