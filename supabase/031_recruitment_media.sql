-- 031: media on recruitment posts.
--
-- WHY: recruiters could not attach an image or video to a role, while
-- professionals could. Recruitment has no media columns and MediaAsset is
-- hard-wired to workPostId, so the media lives directly on the row: an image
-- URL OR a YouTube video URL, never both.
--
-- APPLIED AS RAW SQL, NOT db push - the User_username_key partial index still
-- makes db push refuse to run (see PROJECT_NOTES).

ALTER TABLE "Recruitment"
  ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "videoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "mediaType" TEXT;
