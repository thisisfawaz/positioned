-- 002_like_rls.sql
-- Closes the "unrestricted" flag Supabase shows on the Like table by
-- enabling Row Level Security and allowing each user to touch only
-- their own like rows through the public (PostgREST) API.
--
-- Note: Prisma connects with a privileged role and bypasses RLS, so this
-- protects the anon/authenticated PostgREST path, not the API routes.

BEGIN;

ALTER TABLE "Like" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own likes" ON "Like";
DROP POLICY IF EXISTS "Users can insert their own likes" ON "Like";
DROP POLICY IF EXISTS "Users can delete their own likes" ON "Like";

CREATE POLICY "Users can read their own likes"
    ON "Like" FOR SELECT
    TO authenticated
    USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can insert their own likes"
    ON "Like" FOR INSERT
    TO authenticated
    WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete their own likes"
    ON "Like" FOR DELETE
    TO authenticated
    USING ("userId" = auth.uid()::text);

COMMIT;
