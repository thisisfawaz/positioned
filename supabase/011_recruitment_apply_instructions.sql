-- 011_recruitment_apply_instructions.sql
-- Free-text instructions on how to apply. Additive only.

BEGIN;

ALTER TABLE "Recruitment"
    ADD COLUMN IF NOT EXISTS "applyInstructions" TEXT;

COMMIT;
