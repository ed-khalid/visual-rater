DROP TABLE IF EXISTS artists CASCADE ;

CREATE TABLE artists(
    id uuid primary key ,
    vendor_id varchar(100) NOT NULL,
    name varchar(100) NOT NULL
);

DROP TABLE IF EXISTS albums CASCADE ;
CREATE TABLE albums(
    id uuid primary key ,
    name varchar(250) NOT NULL,
    year INTEGER NOT NULL,
    artist_id uuid references artists(id),
    vendor_id varchar(100) NOT NULL
);

DROP TABLE IF EXISTS songs CASCADE;
CREATE TABLE songs(
    id uuid primary key,
    name varchar(250) NOT NULL,
    artist_id uuid references artists(id),
    album_id uuid references albums(id),
    vendor_id varchar(100) NOT NULL,
    score FLOAT
);


