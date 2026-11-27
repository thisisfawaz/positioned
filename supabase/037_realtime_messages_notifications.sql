-- Publish the tables that drive live messages + notifications.
--
-- WHY: the app polled /api/unread, /api/messages, and /api/notifications.
-- That works, but it is fixed-interval and lazy. This makes the server PUSH
-- row changes so the client can mutate() the relevant SWR keys instantly.
--
-- WHAT REALTIME NEEDS
--   1. The table must be a member of the `supabase_realtime` publication,
--      otherwise Postgres never streams its WAL for it.
--   2. REPLICA IDENTITY FULL so that:
--        - a `filter` on a non-primary-key column (toUserId, ownerId,
--          contactRequestId) can be evaluated, and
--        - UPDATE/DELETE payloads carry the old row values (needed to know
--          which conversation a DELETE belonged to).
--   3. RLS SELECT policies that let the subscriber see the row. These already
--      exist (see 005 and 029); Realtime enforces them, so a user only
--      receives their own requests/replies/document-requests.
--
-- Additive and idempotent.

DO $$
BEGIN
  -- supabase_realtime is created by Supabase; create defensively so this
  -- migration also works on a plain Postgres for local testing.
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

-- ContactRequest: the inbound-message / new-conversation signal.
ALTER TABLE "ContactRequest" REPLICA IDENTITY FULL;

-- ContactReply: a new reply in an open thread.
ALTER TABLE "ContactReply" REPLICA IDENTITY FULL;

-- DocumentRequest: a CV/portfolio request addressed to a post's author.
ALTER TABLE "DocumentRequest" REPLICA IDENTITY FULL;

-- Add to the publication only if not already a member (ALTER PUBLICATION
-- ADD TABLE errors on a duplicate).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
      AND tablename = 'ContactRequest'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "ContactRequest";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
      AND tablename = 'ContactReply'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "ContactReply";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
      AND tablename = 'DocumentRequest'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "DocumentRequest";
  END IF;
END
$$;
