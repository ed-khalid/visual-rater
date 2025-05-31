
ALTER TABLE artist
 ADD COLUMN thumbnail_dominant_colors
 TEXT[];
ALTER TABLE album
  ADD COLUMN thumbnail_dominant_colors
    TEXT[];
