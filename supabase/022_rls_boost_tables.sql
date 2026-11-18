-- Enable RLS on Boost, BoostPost and BoostImpression.
--
-- All three were UNRESTRICTED: with the anon key, anyone could read every
-- boost purchase and every impression (revealing who boosted what and when),
-- or insert fake impressions to inflate someone's numbers.
--
-- Same pattern as 015: Prisma connects with the direct database URL as the
-- table owner and bypasses RLS, so the app keeps working. This only closes the
-- Supabase REST / anon-key path.
--
-- NOTE ON BoostImpression: the app INSERTS impressions on behalf of the VIEWER
-- who was shown the item, so the insert policy checks viewerId. Reads are
-- restricted to the boost owner, since that is who the analytics belong to.

BEGIN;

-- ============ Boost ============

ALTER TABLE "Boost" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "boost_select_own" ON "Boost";
CREATE POLICY "boost_select_own" ON "Boost"
    FOR SELECT
    USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "boost_insert_own" ON "Boost";
CREATE POLICY "boost_insert_own" ON "Boost"
    FOR INSERT
    WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "boost_update_own" ON "Boost";
CREATE POLICY "boost_update_own" ON "Boost"
    FOR UPDATE
    USING (auth.uid()::text = "userId");

-- ============ BoostPost ============

ALTER TABLE "BoostPost" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "boost_post_select_own" ON "BoostPost";
CREATE POLICY "boost_post_select_own" ON "BoostPost"
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM "Boost" b
        WHERE b.id = "BoostPost"."boostId"
          AND b."userId" = auth.uid()::text
      )
    );

DROP POLICY IF EXISTS "boost_post_insert_own" ON "BoostPost";
CREATE POLICY "boost_post_insert_own" ON "BoostPost"
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM "Boost" b
        WHERE b.id = "BoostPost"."boostId"
          AND b."userId" = auth.uid()::text
      )
    );

-- ============ BoostImpression ============

ALTER TABLE "BoostImpression" ENABLE ROW LEVEL SECURITY;

-- The boost owner may read the impressions their boost received.
DROP POLICY IF EXISTS "boost_impression_select_owner" ON "BoostImpression";
CREATE POLICY "boost_impression_select_owner" ON "BoostImpression"
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM "Boost" b
        WHERE b.id = "BoostImpression"."boostId"
          AND b."userId" = auth.uid()::text
      )
    );

-- A viewer may record that they were shown something.
DROP POLICY IF EXISTS "boost_impression_insert_viewer" ON "BoostImpression";
CREATE POLICY "boost_impression_insert_viewer" ON "BoostImpression"
    FOR INSERT
    WITH CHECK (auth.uid()::text = "viewerId");

COMMIT;
