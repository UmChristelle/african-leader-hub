ALTER TYPE "AssetKind" ADD VALUE IF NOT EXISTS 'VIDEO';

ALTER TABLE "ProgramTestimonial"
ADD COLUMN IF NOT EXISTS "mediaAssetId" TEXT;

CREATE INDEX IF NOT EXISTS "ProgramTestimonial_mediaAssetId_idx"
ON "ProgramTestimonial"("mediaAssetId");

DO $$ BEGIN
  ALTER TABLE "ProgramTestimonial"
  ADD CONSTRAINT "ProgramTestimonial_mediaAssetId_fkey"
  FOREIGN KEY ("mediaAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
