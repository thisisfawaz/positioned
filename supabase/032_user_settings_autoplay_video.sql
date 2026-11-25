-- Replay a video when it ends (autoplay on finish). Default ON.
ALTER TABLE "UserSettings"
  ADD COLUMN IF NOT EXISTS "autoplayVideo" BOOLEAN NOT NULL DEFAULT true;
