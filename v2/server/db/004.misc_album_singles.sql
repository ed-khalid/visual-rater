-- An artist's Misc album is called Singles now (the app names new ones that; see MISC_NAME in src/shared/model.ts).
-- Only ones still called Misc: a Misc album the user renamed keeps its name.
update music_albums set name = 'Singles' where misc and name = 'Misc';
