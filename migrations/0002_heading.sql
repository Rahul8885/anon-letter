-- The writer may replace the room's default heading. Null keeps the room's own.
ALTER TABLE messages ADD COLUMN heading TEXT CHECK(heading IS NULL OR length(heading) <= 80);
