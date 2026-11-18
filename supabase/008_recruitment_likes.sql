-- 008_recruitment_likes.sql
-- Adds engagement to recruitment posts. Additive only.

BEGIN;

ALTER TABLE "Recruitment"
    ADD COLUMN IF NOT EXISTS "likes" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Recruitment"
    ADD COLUMN IF NOT EXISTS "shares" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "RecruitmentLike" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "recruitmentId" TEXT NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecruitmentLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RecruitmentLike_userId_recruitmentId_key"
    ON "RecruitmentLike"("userId", "recruitmentId");

CREATE INDEX IF NOT EXISTS "RecruitmentLike_recruitmentId_idx"
    ON "RecruitmentLike"("recruitmentId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RecruitmentLike_userId_fkey') THEN
        ALTER TABLE "RecruitmentLike"
            ADD CONSTRAINT "RecruitmentLike_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RecruitmentLike_recruitmentId_fkey') THEN
        ALTER TABLE "RecruitmentLike"
            ADD CONSTRAINT "RecruitmentLike_recruitmentId_fkey"
            FOREIGN KEY ("recruitmentId") REFERENCES "Recruitment"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

ALTER TABLE "RecruitmentLike" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own recruitment likes" ON "RecruitmentLike";
DROP POLICY IF EXISTS "Users insert own recruitment likes" ON "RecruitmentLike";
DROP POLICY IF EXISTS "Users delete own recruitment likes" ON "RecruitmentLike";

CREATE POLICY "Users read own recruitment likes"
    ON "RecruitmentLike" FOR SELECT
    TO authenticated
    USING ("userId" = auth.uid()::text);

CREATE POLICY "Users insert own recruitment likes"
    ON "RecruitmentLike" FOR INSERT
    TO authenticated
    WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users delete own recruitment likes"
    ON "RecruitmentLike" FOR DELETE
    TO authenticated
    USING ("userId" = auth.uid()::text);

COMMIT;
