-- Theme preference: 'light' | 'dark' | 'system'.
-- Additive column with a default, so existing rows need no backfill. Safe to re-run.

ALTER TABLE "UserSettings"
  ADD COLUMN IF NOT EXISTS "themeMode" TEXT NOT NULL DEFAULT 'light';
