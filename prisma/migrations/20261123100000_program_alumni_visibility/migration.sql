ALTER TABLE "Program"
ADD COLUMN IF NOT EXISTS "showAlumni" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Program"
SET "showAlumni" = true
WHERE "slug" = 'aheza';
