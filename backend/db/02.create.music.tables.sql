DROP TABLE IF EXISTS artist_metadata CASCADE;
DROP TABLE IF EXISTS artist CASCADE ;

create table artist_metadata
(
    id       uuid primary key not null,
    bad      int4 not null,
    classic  int4 not null,
    good     int4 not null,
    great    int4 not null,
    mediocre int4 not null,
    terrible int4 not null,
    classic_percentage float,
    great_percentage float,
    good_percentage float,
    mediocre_percentage float,
    bad_percentage float,
    terrible_percentage float,
    total_songs int4 ,
    total_albums int4,
    tier    int4
);

CREATE TABLE artist(
                       id uuid primary key ,
                       name varchar(100) NOT NULL,
                       thumbnail varchar(100),
                       score float,
                       metadata_id uuid references artist_metadata
);


DROP TABLE IF EXISTS album CASCADE ;
CREATE TABLE album(
    id uuid primary key ,
    name varchar(250) NOT NULL,
    thumbnail varchar(100),
    year INTEGER NOT NULL,
    artist_id uuid references artist(id),
    score float
);

DROP TABLE IF EXISTS song CASCADE;
CREATE TABLE song(
    id uuid primary key,
    name varchar(250) NOT NULL,
    number int4,
    disc_number int4,
    artist_id uuid references artist(id),
    album_id uuid references album(id),
    score FLOAT
);


