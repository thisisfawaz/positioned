-- Document handover: a viewer asks a post's author for a CV and/or portfolio.
--
-- THE FLOW THIS SUPPORTS
--   1. A viewer clicks the CTA on a post (Request CV / Request Portfolio /
--      CV & Portfolio). That creates ONE row here, status PENDING.
--   2. The author sees it in notifications (derived, not stored - see
--      app/api/notifications) and opens a form to paste the links.
--   3. The links are saved here and the row becomes FULFILLED. The requester
--      then sees labelled CV / Portfolio links on /requests.
--
-- LINKS, NOT FILES. Only URLs are stored. There is no upload, no storage
-- bucket, no parsing. This is deliberate: public/uploads is LOCAL-only and a
-- deploy blocker (see 028), so documents must not depend on it.
--
-- ONE ROW PER (post, requester). A person asking twice should not create a
-- second pending request or a second notification - the app reuses the
-- existing row. The unique index below enforces that at the database level so
-- a race between two clicks cannot produce duplicates.
--
-- Additive only.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DocumentRequestStatus') THEN
    CREATE TYPE "DocumentRequestStatus" AS ENUM ('PENDING', 'FULFILLED', 'DECLINED');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "DocumentRequest" (
  "id"           TEXT NOT NULL PRIMARY KEY,
  -- The post whose CTA was clicked. Cascades: a deleted post takes its
  -- requests with it, since the links only make sense in that context.
  "postId"       TEXT NOT NULL,
  -- Who asked. Kept even if their account goes, so the author can see who
  -- they are sharing with; SET NULL rather than CASCADE to avoid silently
  -- deleting a fulfilled request.
  "requesterId"  TEXT,
  -- The author who must fulfil. This is the person the notification goes to.
  "ownerId"      TEXT NOT NULL,
  -- What was asked for. Reuses the existing ResponseType enum so the post's
  -- CTA and the request it creates can never disagree.
  "response"     "ResponseType" NOT NULL,
  "status"       "DocumentRequestStatus" NOT NULL DEFAULT 'PENDING',
  "cvUrl"        TEXT,
  "portfolioUrl" TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fulfilledAt"  TIMESTAMP(3),

  CONSTRAINT "DocumentRequest_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "WorkPost"("id") ON DELETE CASCADE,
  CONSTRAINT "DocumentRequest_requesterId_fkey"
    FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE SET NULL,
  CONSTRAINT "DocumentRequest_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Reuse rather than duplicate: one request per post per requester.
CREATE UNIQUE INDEX IF NOT EXISTS "DocumentRequest_postId_requesterId_key"
  ON "DocumentRequest"("postId", "requesterId");

-- The author's notification query and the requester's /requests list.
CREATE INDEX IF NOT EXISTS "DocumentRequest_ownerId_status_idx"
  ON "DocumentRequest"("ownerId", "status");
CREATE INDEX IF NOT EXISTS "DocumentRequest_requesterId_idx"
  ON "DocumentRequest"("requesterId");

-- ============ RLS ============
-- Prisma connects as the table owner and bypasses RLS, so the app keeps
-- working. This closes the Supabase anon-key path: without it, anyone could
-- read every request and every shared CV/portfolio link.

ALTER TABLE "DocumentRequest" ENABLE ROW LEVEL SECURITY;

-- The requester may see the request they made.
DROP POLICY IF EXISTS "document_request_select_requester" ON "DocumentRequest";
CREATE POLICY "document_request_select_requester" ON "DocumentRequest"
    FOR SELECT
    USING (auth.uid()::text = "requesterId");

-- The author may see requests addressed to them.
DROP POLICY IF EXISTS "document_request_select_owner" ON "DocumentRequest";
CREATE POLICY "document_request_select_owner" ON "DocumentRequest"
    FOR SELECT
    USING (auth.uid()::text = "ownerId");

-- A requester creates the row, and may only create it as themselves.
DROP POLICY IF EXISTS "document_request_insert_requester" ON "DocumentRequest";
CREATE POLICY "document_request_insert_requester" ON "DocumentRequest"
    FOR INSERT
    WITH CHECK (auth.uid()::text = "requesterId");

-- Only the author fills in the links.
DROP POLICY IF EXISTS "document_request_update_owner" ON "DocumentRequest";
CREATE POLICY "document_request_update_owner" ON "DocumentRequest"
    FOR UPDATE
    USING (auth.uid()::text = "ownerId");
