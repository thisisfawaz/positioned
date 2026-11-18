-- 004_add_recruitments.sql
-- Standalone recruitment posts, created by recruiters. Nothing shared
-- with WorkPost.

BEGIN;

CREATE TABLE IF NOT EXISTS "Recruitment" (
    "id"           TEXT NOT NULL,
    "recruiterId"  TEXT NOT NULL,
    "title"        TEXT NOT NULL,
    "organization" TEXT,
    "location"     TEXT,
    "employmentType" TEXT,
    "description"  TEXT,
    "requirements" TEXT,
    "salaryRange"  TEXT,
    "closingDate"  TIMESTAMP(3),
    "status"       TEXT NOT NULL DEFAULT 'OPEN',
    "views"        INTEGER NOT NULL DEFAULT 0,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recruitment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Recruitment_recruiterId_idx"
    ON "Recruitment"("recruiterId");

CREATE INDEX IF NOT EXISTS "Recruitment_createdAt_idx"
    ON "Recruitment"("createdAt");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Recruitment_recruiterId_fkey') THEN
        ALTER TABLE "Recruitment"
            ADD CONSTRAINT "Recruitment_recruiterId_fkey"
            FOREIGN KEY ("recruiterId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

COMMIT;
