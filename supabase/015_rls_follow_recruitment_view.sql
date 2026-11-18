-- 015_rls_follow_recruitment_view.sql
-- Enable RLS on Follow and RecruitmentView.
--
-- The app writes to these tables through Prisma using the direct database
-- connection, which connects as the table owner and bypasses RLS. Enabling RLS
-- therefore does not affect app behaviour - it only closes the hole where the
-- public anon key could read or write these tables via Supabase's REST API.

BEGIN;

-- ============ Follow ============

ALTER TABLE "Follow" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follow_select_own" ON "Follow";
CREATE POLICY "follow_select_own" ON "Follow"
    FOR SELECT
    USING (auth.uid()::text = "followerId");

DROP POLICY IF EXISTS "follow_insert_own" ON "Follow";
CREATE POLICY "follow_insert_own" ON "Follow"
    FOR INSERT
    WITH CHECK (auth.uid()::text = "followerId");

DROP POLICY IF EXISTS "follow_delete_own" ON "Follow";
CREATE POLICY "follow_delete_own" ON "Follow"
    FOR DELETE
    USING (auth.uid()::text = "followerId");

-- ============ RecruitmentView ============

ALTER TABLE "RecruitmentView" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recruitment_view_select_own" ON "RecruitmentView";
CREATE POLICY "recruitment_view_select_own" ON "RecruitmentView"
    FOR SELECT
    USING (auth.uid()::text = "viewerId");

DROP POLICY IF EXISTS "recruitment_view_insert_own" ON "RecruitmentView";
CREATE POLICY "recruitment_view_insert_own" ON "RecruitmentView"
    FOR INSERT
    WITH CHECK (auth.uid()::text = "viewerId");

COMMIT;
