DROP TABLE IF EXISTS lu_item_types;
CREATE TABLE lu_item_types (
    id serial primary key,
    name varchar(50)
);
INSERT INTO lu_item_types values
(DEFAULT,'Music');

