-- 012_recruitment_views.sql
-- Per-user recruitment view tracking, mirroring WorkView. Additive only.

BEGIN;

CREATE TABLE IF NOT EXISTS "RecruitmentView" (
    "id" TEXT PRIMARY KEY,
    "recruitmentId" TEXT NOT NULL REFERENCES "Recruitment"("id") ON DELETE CASCADE,
    "viewerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "RecruitmentView_recruitmentId_viewerId_key"
    ON "RecruitmentView"("recruitmentId", "viewerId");

CREATE INDEX IF NOT EXISTS "RecruitmentView_recruitmentId_idx"
    ON "RecruitmentView"("recruitmentId");

COMMIT;
