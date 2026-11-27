-- Portfolio link for professional profiles. Sits BEFORE the social links in
-- the editor and renders as its own button under Message / Add to list.
-- Separate from the social links: it does not satisfy the "at least one social
-- link" rule and is purely an optional showcase link.
-- Additive and idempotent.

ALTER TABLE "ProfessionalProfile"
  ADD COLUMN IF NOT EXISTS "portfolioUrl" TEXT;
