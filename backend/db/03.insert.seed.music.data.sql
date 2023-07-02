
DO $$
 DECLARE artist_uuid uuid = uuid_generate_v1();
 DECLARE album_uuid uuid = uuid_generate_v1();
     BEGIN
INSERT INTO artist VALUES (artist_uuid, null, 'Metallica',null,0);
INSERT INTO album VALUES (album_uuid, 'Master of Puppets', 1, 1986);
INSERT INTO song VALUES(uuid_generate_v1(), null,'Battery',1,1,artist_uuid,album_uuid,3.6);
INSERT INTO song VALUES(uuid_generate_v1(), null,'Master of Puppets',2,1,artist_uuid,album_uuid,4.3);
INSERT INTO song VALUES(uuid_generate_v1(), null,'The Thing That Should Not Be',3,1,artist_uuid,album_uuid,3.5);
INSERT INTO song VALUES(uuid_generate_v1(), null,'Welcome Home (Sanitarium)',4,1,artist_uuid,album_uuid,3.4);
INSERT INTO song VALUES(uuid_generate_v1(), null,'Disposable Heroes',5,1,artist_uuid,album_uuid,4.1);
INSERT INTO song VALUES(uuid_generate_v1(), null,'Leper Messiah',6,1,artist_uuid,album_uuid,3.8);
INSERT INTO song VALUES(uuid_generate_v1(), null,'Orion',7,1,artist_uuid,album_uuid,4.2);
INSERT INTO song VALUES(uuid_generate_v1(), null,'Damage, Inc.',8,1,artist_uuid,album_uuid,3.6);

END
    $$
