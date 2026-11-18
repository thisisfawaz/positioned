-- Work history is shared by professionals and recruiters.
--
-- The Experience model already existed for professionals and was NEVER used in
-- the UI. Recruiters had no equivalent. Rather than duplicate the table, the FK
-- to ProfessionalProfile becomes nullable and a new nullable FK to
-- RecruiterProfile is added. Exactly one is set per row.

ALTER TABLE "Experience"
  ALTER COLUMN "professionalId" DROP NOT NULL;

ALTER TABLE "Experience"
  ADD COLUMN IF NOT EXISTS "recruiterProfileId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Experience_recruiterProfileId_fkey'
  ) THEN
    ALTER TABLE "Experience"
      ADD CONSTRAINT "Experience_recruiterProfileId_fkey"
      FOREIGN KEY ("recruiterProfileId") REFERENCES "RecruiterProfile"("id")
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Experience_professionalId_idx"
  ON "Experience"("professionalId");
CREATE INDEX IF NOT EXISTS "Experience_recruiterProfileId_idx"
  ON "Experience"("recruiterProfileId");
