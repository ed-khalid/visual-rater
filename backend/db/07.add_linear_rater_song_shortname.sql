DROP TABLE IF EXISTS song_linear_rater_shortname;
CREATE TABLE song_linear_rater_shortname (
                       id serial primary key,
                       shortname varchar(10) NOT NULL,
                       song_id uuid NOT NULL UNIQUE REFERENCES song(id)
);
