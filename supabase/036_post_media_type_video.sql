-- 036: add VIDEO to the PostMediaType enum (uploaded video via Cloudinary).
--
-- Raw SQL, NOT `prisma db push` - see the User_username_key drift note in
-- PROJECT_NOTES.md. ALTER TYPE ... ADD VALUE is idempotent with IF NOT EXISTS.

ALTER TYPE "PostMediaType" ADD VALUE IF NOT EXISTS 'VIDEO';
