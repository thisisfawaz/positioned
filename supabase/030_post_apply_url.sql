-- An application link for posts whose desiredResponse is APPLY.
--
-- WHY: Apply is NOT a document handover and NOT a message. A recruiter posting
-- a vacancy with "Apply" needs to say WHERE to apply, so the CTA can send the
-- applicant somewhere useful in a new tab. Before this, Apply fell through to
-- the same /messages link as Message, which was wrong twice over: it is not a
-- conversation, and it gave the applicant nowhere to actually apply.
--
-- Nullable: only APPLY posts need it. The composer asks for it when APPLY is
-- chosen, and the server action refuses an APPLY post without it.
--
-- Additive only.

ALTER TABLE "WorkPost"
  ADD COLUMN IF NOT EXISTS "applyUrl" TEXT;
