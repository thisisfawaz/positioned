-- 010_recruitment_salary_hidden_apply_method.sql
-- Salary opt-out flag and apply method selector. Additive only.

BEGIN;

ALTER TABLE "Recruitment"
    ADD COLUMN IF NOT EXISTS "salaryHidden" BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS "applyMethod" TEXT NOT NULL DEFAULT 'LINK';

COMMIT;
