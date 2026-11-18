-- 001_add_likes.sql
-- Adds real likes to the feed: a Like join table plus a denormalised
-- counter on WorkPost. Comments are intentionally NOT part of this schema.
--
-- Additive only: creates one table, adds one column with a default.
-- Nothing is dropped or altered destructively.

BEGIN;

CREATE TABLE IF NOT EXISTS "Like" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "workPostId" TEXT NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Like_userId_workPostId_key"
    ON "Like"("userId", "workPostId");

CREATE INDEX IF NOT EXISTS "Like_workPostId_idx" ON "Like"("workPostId");

ALTER TABLE "WorkPost"
    ADD COLUMN IF NOT EXISTS "likes" INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Like_userId_fkey') THEN
        ALTER TABLE "Like"
            ADD CONSTRAINT "Like_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Like_workPostId_fkey') THEN
        ALTER TABLE "Like"
            ADD CONSTRAINT "Like_workPostId_fkey"
            FOREIGN KEY ("workPostId") REFERENCES "WorkPost"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

COMMIT;
