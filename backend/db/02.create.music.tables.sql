DROP TABLE IF EXISTS artist CASCADE ;

CREATE TABLE artist(
    id uuid primary key ,
    vendor_id varchar(100) NOT NULL,
    name varchar(100) NOT NULL
);

DROP TABLE IF EXISTS album CASCADE ;
CREATE TABLE album(
    id uuid primary key ,
    name varchar(250) NOT NULL,
    year INTEGER NOT NULL,
    artist_id uuid references artist(id),
    vendor_id varchar(100) NOT NULL
);

DROP TABLE IF EXISTS song CASCADE;
CREATE TABLE song(
    id uuid primary key,
    name varchar(250) NOT NULL,
    artist_id uuid references artist(id),
    album_id uuid references album(id),
    vendor_id varchar(100) NOT NULL,
    score FLOAT
);


