-- Replace the slot-based boost model with campaign + pre-computed turns.
--
-- VisibilityBoost and VisibilitySlot were verified EMPTY before this migration
-- was written (0 boosts, 0 slots, 0 payments), so dropping them loses no data.
-- They were also the wrong shape: slot-based per-day inventory cannot express
-- hourly rotation across two surfaces.

-- 1. Drop the old model. Payment's FK must go first.
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_boostId_fkey";
DROP TABLE IF EXISTS "VisibilityBoost" CASCADE;
DROP TABLE IF EXISTS "VisibilitySlot" CASCADE;
DROP TYPE IF EXISTS "SlotStatus";

-- 2. Boost - one purchase, many posts, one window.
CREATE TABLE IF NOT EXISTS "Boost" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "amount"    DOUBLE PRECISION NOT NULL,
  "currency"  TEXT NOT NULL,
  "days"      INTEGER NOT NULL,
  "startsAt"  TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "status"    TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Boost_userId_status_idx" ON "Boost"("userId", "status");

-- 3. BoostPost - which posts were selected.
CREATE TABLE IF NOT EXISTS "BoostPost" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "boostId"    TEXT NOT NULL REFERENCES "Boost"("id") ON DELETE CASCADE,
  "workPostId" TEXT NOT NULL REFERENCES "WorkPost"("id") ON DELETE CASCADE,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BoostPost_boostId_workPostId_key" UNIQUE ("boostId", "workPostId")
);

-- 4. BoostTurn - the pre-computed hourly rotation.
CREATE TABLE IF NOT EXISTS "BoostTurn" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "boostId"    TEXT NOT NULL REFERENCES "Boost"("id") ON DELETE CASCADE,
  "surface"    TEXT NOT NULL,
  "workPostId" TEXT REFERENCES "WorkPost"("id") ON DELETE CASCADE,
  "startsAt"   TIMESTAMP(3) NOT NULL,
  "endsAt"     TIMESTAMP(3) NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "BoostTurn_surface_startsAt_endsAt_idx"
  ON "BoostTurn"("surface", "startsAt", "endsAt");
CREATE INDEX IF NOT EXISTS "BoostTurn_boostId_idx" ON "BoostTurn"("boostId");

-- 5. Re-point Payment at Boost.
ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_boostId_fkey"
  FOREIGN KEY ("boostId") REFERENCES "Boost"("id") ON DELETE SET NULL;
