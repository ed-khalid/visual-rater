
DO $$
DECLARE artist_uuid uuid = uuid_generate_v1();
DECLARE album_uuid uuid = uuid_generate_v1();
BEGIN
INSERT INTO artist VALUES (artist_uuid, 'Metallica', null, 0, null);
INSERT INTO album VALUES (album_uuid, 'Master of Puppets', null, 1986, artist_uuid);
INSERT INTO song VALUES(uuid_generate_v1(), 'Battery', 1, 1, artist_uuid, album_uuid, 3.6);
INSERT INTO song VALUES(uuid_generate_v1(), 'Master of Puppets', 2, 1, artist_uuid, album_uuid, 4.3);
INSERT INTO song VALUES(uuid_generate_v1(), 'The Thing That Should Not Be', 3, 1, artist_uuid, album_uuid, 3.5);
INSERT INTO song VALUES(uuid_generate_v1(), 'Welcome Home (Sanitarium)', 4, 1, artist_uuid, album_uuid, 3.4);
INSERT INTO song VALUES(uuid_generate_v1(), 'Disposable Heroes', 5, 1, artist_uuid, album_uuid, 4.1);
INSERT INTO song VALUES(uuid_generate_v1(), 'Leper Messiah', 6, 1, artist_uuid, album_uuid, 3.8);
INSERT INTO song VALUES(uuid_generate_v1(), 'Orion', 7, 1, artist_uuid, album_uuid, 4.2);
INSERT INTO song VALUES(uuid_generate_v1(), 'Damage, Inc.', 8, 1, artist_uuid, album_uuid, 3.6);

END
$$
