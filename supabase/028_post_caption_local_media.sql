-- Free posting: a caption plus locally stored media.
--
-- CAPTION: the free-form body of a post. The structured fields (purpose,
-- challenge, goal, ...) stay exactly as they are and remain nullable, so a
-- templated post uses those and a free post uses caption. Neither excludes the
-- other - a post can carry a caption AND a template if the author fills both.
--
-- LOCAL MEDIA: MediaAsset.provider is an enum of external providers. Uploads
-- written to public/uploads need their own value. LOCAL is deliberately
-- temporary - files in public/ are baked at build time and do NOT survive on
-- Vercel. Swap to S3 (or similar) before deploying.
--
-- Additive only.

ALTER TABLE "WorkPost"
  ADD COLUMN IF NOT EXISTS "caption" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'StorageProvider' AND e.enumlabel = 'LOCAL'
  ) THEN
    ALTER TYPE "StorageProvider" ADD VALUE 'LOCAL';
  END IF;
END
$$;
