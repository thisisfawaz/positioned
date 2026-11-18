-- User settings: notification, privacy and messaging preferences.
--
-- Additive only - a new table, no changes to existing ones. Safe to re-run.

CREATE TABLE IF NOT EXISTS "UserSettings" (
  "id"                     TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"                 TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "notifyMessages"         BOOLEAN NOT NULL DEFAULT true,
  "notifyList"             BOOLEAN NOT NULL DEFAULT true,
  "notifyRoles"            BOOLEAN NOT NULL DEFAULT true,
  "profileVisible"         BOOLEAN NOT NULL DEFAULT true,
  "allowRecruiterMessages" BOOLEAN NOT NULL DEFAULT true,
  "createdAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "UserSettings_userId_idx" ON "UserSettings"("userId");

-- Enable RLS: like Follow and RecruitmentView, only the owner may read or
-- write their own row over the Supabase REST path. Prisma connects as the
-- table owner and bypasses this, which is how the app keeps working.
ALTER TABLE "UserSettings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usersettings_select_own" ON "UserSettings";
CREATE POLICY "usersettings_select_own" ON "UserSettings"
  FOR SELECT USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "usersettings_update_own" ON "UserSettings";
CREATE POLICY "usersettings_update_own" ON "UserSettings"
  FOR UPDATE USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "usersettings_insert_own" ON "UserSettings";
CREATE POLICY "usersettings_insert_own" ON "UserSettings"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
