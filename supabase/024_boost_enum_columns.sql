-- Fix the type mismatch between schema.prisma and the database.
--
-- 020 created these columns as TEXT while schema.prisma declares enums. Prisma
-- sends the enum type in queries, Postgres compares text = enum and fails with
--   42883 operator does not exist: text = "BoostStatus"
-- Nothing caught this earlier because nothing had queried these tables until
-- the inspect script ran - prisma validate and generate only read the SCHEMA
-- file, never the database.
--
-- The tables are empty, so the USING casts cannot fail on existing values.
-- Verified before writing this: all three columns are `text`, and no rows exist
-- in Boost, BoostPost or BoostImpression.

BEGIN;

-- BoostSurface enum never existed in the database at all.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BoostSurface') THEN
    CREATE TYPE "BoostSurface" AS ENUM ('FEED', 'EXPLORE');
  END IF;
END $$;

-- Boost.status: text -> BoostStatus
ALTER TABLE "Boost"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Boost"
  ALTER COLUMN "status" TYPE "BoostStatus"
  USING "status"::"BoostStatus";

ALTER TABLE "Boost"
  ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"BoostStatus";

-- BoostImpression.surface: text -> BoostSurface
ALTER TABLE "BoostImpression"
  ALTER COLUMN "surface" TYPE "BoostSurface"
  USING "surface"::"BoostSurface";

-- BoostImpression.viewerRole: text -> UserRole (nullable)
ALTER TABLE "BoostImpression"
  ALTER COLUMN "viewerRole" TYPE "UserRole"
  USING "viewerRole"::"UserRole";

COMMIT;
