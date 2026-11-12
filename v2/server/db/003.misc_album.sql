-- A "Misc" album: one per artist, holding the songs added on their own whose real album isn't in the catalog. It has
-- no album score or grade of its own (the app leaves it out of those); its songs count for the artist as usual.
alter table music_albums add column misc boolean not null default false;
create unique index music_albums_one_misc_per_artist on music_albums (artist_id) where misc;
