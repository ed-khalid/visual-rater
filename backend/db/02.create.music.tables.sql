DROP TABLE IF EXISTS artist_metadata CASCADE;
DROP TABLE IF EXISTS artist CASCADE ;

create table artist_metadata
(
    id       uuid primary key not null,
    classic  int4 not null,
    great    int4 not null,
    verygood  int4 not null,
    good     int4 not null,
    pleasant     int4 not null,
    decent     int4 not null,
    interesting     int4 not null,
    ok     int4 not null,
    meh     int4 not null,
    average int4 not null,
    boring int4 not null,
    poor int4 not null,
    bad      int4 not null,
    offensive int4 not null,
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
    dominant_color varchar(20),
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


