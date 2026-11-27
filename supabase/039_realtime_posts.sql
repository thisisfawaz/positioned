-- Publish WorkPost so a newly created/edited/deleted post shows on the feed
-- and on the author's profile WITHOUT a page reload.
--
-- WorkPost's owner columns are professionalId / recruiterProfileId (PROFILE
-- ids, not user ids), so there is no single user id to filter on server-side.
-- We therefore subscribe to the whole table and let the API re-run its own
-- visibility + ranking rules on revalidation. The event carries only the row;
-- nothing the client could not already fetch is exposed, because:
--   - only PUBLISHED posts are visible via the APIs, and
--   - WorkPost SELECT is broadly readable (it is public showcase data).
-- Realtime still honors RLS, so a row a subscriber cannot SELECT is not sent.
--
-- REPLICA IDENTITY FULL is set so UPDATE/DELETE payloads carry the old owner
-- columns (useful if we later scope the filter client-side).
--
-- Additive and idempotent.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

ALTER TABLE "WorkPost" REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
      AND tablename = 'WorkPost'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "WorkPost";
  END IF;
END
$$;
