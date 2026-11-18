-- 003_add_username.sql
-- Adds a unique, optional username to User. Additive only.

BEGIN;

ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "username" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key"
    ON "User"("username")
    WHERE "username" IS NOT NULL;

COMMIT;
