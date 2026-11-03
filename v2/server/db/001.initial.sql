-- v2 schema. Applied automatically by the API server at startup (server/migrate.ts), once, in order.
-- Add new migrations as the next number; never edit one that has been applied.

create table item_types (
  id        text primary key,
  name      text not null unique,
  built_in  boolean not null default false
);

insert into item_types (id, name, built_in) values
  ('music', 'MUSIC', true),
  ('movies', 'MOVIES', true),
  ('books', 'BOOKS', true);

-- One ranking medium per item type.
create table boards (
  id       uuid primary key,
  type_id  text not null references item_types (id),
  name     text not null,
  axis     text not null default 'linear',
  bands    jsonb not null default '[]'
);

-- Anything that can be ranked. Albums carry their (editable) tracklist; tracks point back at their album.
create table items (
  id               uuid primary key,
  type_id          text not null references item_types (id),
  name             text not null,
  image            text,
  colors           text[],
  source_provider  text,
  source_kind      text,
  source_id        text,
  artist           text,
  year             integer,
  album_id         uuid references items (id) on delete set null deferrable initially deferred,
  tracks           jsonb,
  check ((source_provider is null) = (source_kind is null) and (source_kind is null) = (source_id is null))
);

create index items_album_id on items (album_id);

-- An item on a board: waiting in the staging tray, an album whose tracks have been added, or placed on the tree
-- (with its position, 0 bottom to 1 top, and its branch).
create table board_items (
  board_id  uuid not null references boards (id) on delete cascade,
  item_id   uuid not null references items (id) on delete cascade deferrable initially deferred,
  status    text not null check (status in ('staged', 'added', 'placed')),
  since     bigint not null,
  position  double precision check (position between 0 and 1),
  angle     double precision,
  length    double precision check (length > 0),
  ring      integer check (ring >= 0),
  primary key (board_id, item_id),
  check (status <> 'placed' or (position is not null and angle is not null and length is not null and ring is not null))
);
