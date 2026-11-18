-- 006_add_responsibilities.sql
-- Adds a responsibilities field to Recruitment. Additive only.

BEGIN;

ALTER TABLE "Recruitment"
    ADD COLUMN IF NOT EXISTS "responsibilities" TEXT;

COMMIT;
