-- Boost credits: a wallet the user spends to run boosts.
--
-- $1 buys 1 boost. A boost buys one day of visibility, except in the
-- discounted bundles: 14 days costs 12 boosts, 30 days costs 20.
--
-- Additive only. Existing boost rows keep creditsSpent = 0, which is correct -
-- they were granted before the wallet existed.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "boostCredits" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Boost"
  ADD COLUMN IF NOT EXISTS "creditsSpent" INTEGER NOT NULL DEFAULT 0;
