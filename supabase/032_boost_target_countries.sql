-- Boost country targeting.
--
-- A boost may restrict which countries it appears in, keyed by ISO 3166-1
-- alpha-2 code (e.g. 'GB', 'NG'). Stored as a text array so one boost can
-- target several countries.
--
-- EMPTY ARRAY = NO RESTRICTION = everywhere. That is the default, so every
-- existing boost row keeps behaving exactly as it did before this migration
-- and no backfill is needed.
--
-- The country is resolved from the viewer's IP at request time (Vercel sets
-- x-vercel-ip-country). If a viewer's country cannot be determined, they are
-- treated as a match for every boost rather than being shown nothing.

ALTER TABLE "Boost"
  ADD COLUMN IF NOT EXISTS "targetCountries" TEXT[] NOT NULL DEFAULT '{}';
