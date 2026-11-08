-- One or two words shown for a track on the rater instead of its full name (src/shared/names.ts `shortTitle`).
-- Nullable: tracks saved before this have none, and show their full name.
alter table music_tracks add column short_title text check (short_title is null or length(trim(short_title)) between 1 and 40);
