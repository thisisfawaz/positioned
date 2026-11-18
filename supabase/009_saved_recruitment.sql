-- 009_saved_recruitment.sql
-- Lets users save recruitment posts. Additive only.

BEGIN;

ALTER TABLE "Recruitment"
    ADD COLUMN IF NOT EXISTS "saves" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "SavedRecruitment" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "recruitmentId" TEXT NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedRecruitment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SavedRecruitment_userId_recruitmentId_key"
    ON "SavedRecruitment"("userId", "recruitmentId");

CREATE INDEX IF NOT EXISTS "SavedRecruitment_recruitmentId_idx"
    ON "SavedRecruitment"("recruitmentId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SavedRecruitment_userId_fkey') THEN
        ALTER TABLE "SavedRecruitment"
            ADD CONSTRAINT "SavedRecruitment_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SavedRecruitment_recruitmentId_fkey') THEN
        ALTER TABLE "SavedRecruitment"
            ADD CONSTRAINT "SavedRecruitment_recruitmentId_fkey"
            FOREIGN KEY ("recruitmentId") REFERENCES "Recruitment"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

ALTER TABLE "SavedRecruitment" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own saved recruitments" ON "SavedRecruitment";
DROP POLICY IF EXISTS "Users insert own saved recruitments" ON "SavedRecruitment";
DROP POLICY IF EXISTS "Users delete own saved recruitments" ON "SavedRecruitment";

CREATE POLICY "Users read own saved recruitments"
    ON "SavedRecruitment" FOR SELECT
    TO authenticated
    USING ("userId" = auth.uid()::text);

CREATE POLICY "Users insert own saved recruitments"
    ON "SavedRecruitment" FOR INSERT
    TO authenticated
    WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users delete own saved recruitments"
    ON "SavedRecruitment" FOR DELETE
    TO authenticated
    USING ("userId" = auth.uid()::text);

COMMIT;
