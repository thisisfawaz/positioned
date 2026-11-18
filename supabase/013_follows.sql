-- 013_follows.sql
-- Follow relationships between users. Additive only.

BEGIN;

CREATE TABLE IF NOT EXISTS "Follow" (
    "id" TEXT PRIMARY KEY,
    "followerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "followingId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "Follow_followerId_followingId_key"
    ON "Follow"("followerId", "followingId");

CREATE INDEX IF NOT EXISTS "Follow_followingId_idx"
    ON "Follow"("followingId");

COMMIT;
