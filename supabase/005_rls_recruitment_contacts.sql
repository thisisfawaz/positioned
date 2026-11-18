-- 005_rls_recruitment_contacts.sql
-- Closes the "unrestricted" flags on Recruitment, ContactRequest
-- and ContactReply. Prisma connects with a privileged role and
-- bypasses RLS, so this protects the anon/authenticated PostgREST path.

BEGIN;

-- ----------------------------------------------------------------
-- Recruitment
-- ----------------------------------------------------------------
ALTER TABLE "Recruitment" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recruitments are readable by all" ON "Recruitment";
DROP POLICY IF EXISTS "Recruiters insert own recruitments" ON "Recruitment";
DROP POLICY IF EXISTS "Recruiters update own recruitments" ON "Recruitment";
DROP POLICY IF EXISTS "Recruiters delete own recruitments" ON "Recruitment";

CREATE POLICY "Recruitments are readable by all"
    ON "Recruitment" FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Recruiters insert own recruitments"
    ON "Recruitment" FOR INSERT
    TO authenticated
    WITH CHECK ("recruiterId" = auth.uid()::text);

CREATE POLICY "Recruiters update own recruitments"
    ON "Recruitment" FOR UPDATE
    TO authenticated
    USING ("recruiterId" = auth.uid()::text)
    WITH CHECK ("recruiterId" = auth.uid()::text);

CREATE POLICY "Recruiters delete own recruitments"
    ON "Recruitment" FOR DELETE
    TO authenticated
    USING ("recruiterId" = auth.uid()::text);

-- ----------------------------------------------------------------
-- ContactRequest
-- ----------------------------------------------------------------
ALTER TABLE "ContactRequest" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants read their contact requests" ON "ContactRequest";
DROP POLICY IF EXISTS "Users create their own contact requests" ON "ContactRequest";
DROP POLICY IF EXISTS "Participants update their contact requests" ON "ContactRequest";

CREATE POLICY "Participants read their contact requests"
    ON "ContactRequest" FOR SELECT
    TO authenticated
    USING (
        "fromUserId" = auth.uid()::text
        OR "toUserId" = auth.uid()::text
    );

CREATE POLICY "Users create their own contact requests"
    ON "ContactRequest" FOR INSERT
    TO authenticated
    WITH CHECK ("fromUserId" = auth.uid()::text);

CREATE POLICY "Participants update their contact requests"
    ON "ContactRequest" FOR UPDATE
    TO authenticated
    USING (
        "fromUserId" = auth.uid()::text
        OR "toUserId" = auth.uid()::text
    )
    WITH CHECK (
        "fromUserId" = auth.uid()::text
        OR "toUserId" = auth.uid()::text
    );

-- ----------------------------------------------------------------
-- ContactReply
-- ----------------------------------------------------------------
ALTER TABLE "ContactReply" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants read replies" ON "ContactReply";
DROP POLICY IF EXISTS "Users create their own replies" ON "ContactReply";
DROP POLICY IF EXISTS "Users delete their own replies" ON "ContactReply";

CREATE POLICY "Participants read replies"
    ON "ContactReply" FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "ContactRequest" cr
            WHERE cr."id" = "ContactReply"."contactRequestId"
              AND (
                  cr."fromUserId" = auth.uid()::text
                  OR cr."toUserId" = auth.uid()::text
              )
        )
    );

CREATE POLICY "Users create their own replies"
    ON "ContactReply" FOR INSERT
    TO authenticated
    WITH CHECK ("fromUserId" = auth.uid()::text);

CREATE POLICY "Users delete their own replies"
    ON "ContactReply" FOR DELETE
    TO authenticated
    USING ("fromUserId" = auth.uid()::text);

COMMIT;
