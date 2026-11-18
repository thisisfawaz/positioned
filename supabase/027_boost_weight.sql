-- Boost weight: how much share of the boosted slot a purchase commands.
--
-- A boost is no longer "N days of visibility". It is a WEIGHTED STAKE over a
-- fixed window: spending 5 boosts gives weight 5, and assignment favours it
-- proportionally. That is what makes "spend more boosts in one day" mean
-- something - the extra spend competes for a bigger share of the same window.
--
-- Additive only. Existing boost rows keep weight = 1, which is correct: under
-- the old model every active boost had an equal share, so weight 1 reproduces
-- exactly the previous behaviour for them.

ALTER TABLE "Boost"
  ADD COLUMN IF NOT EXISTS "weight" INTEGER NOT NULL DEFAULT 1;
