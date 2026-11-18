-- Impressions: proof that a boosted item was actually shown.
--
-- Assignment is computed per viewer per hour, so without this table there is
-- no record that anything was displayed. "Times at the top" and "recruiters who
-- saw my work" both depend on it.

CREATE TABLE IF NOT EXISTS "BoostImpression" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "boostId"    TEXT NOT NULL REFERENCES "Boost"("id") ON DELETE CASCADE,
  "workPostId" TEXT REFERENCES "WorkPost"("id") ON DELETE CASCADE,
  "viewerId"   TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "viewerRole" TEXT,
  "surface"    TEXT NOT NULL,
  "shownAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "BoostImpression_boostId_shownAt_idx"
  ON "BoostImpression"("boostId", "shownAt");
CREATE INDEX IF NOT EXISTS "BoostImpression_workPostId_idx"
  ON "BoostImpression"("workPostId");
