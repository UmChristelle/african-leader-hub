/*
  Properly rename detailsHtml -> descriptionHtml and detailsJson -> descriptionJson
  using RENAME COLUMN to preserve data.
*/

-- Rename columns instead of dropping
ALTER TABLE "Program" RENAME COLUMN "detailsHtml" TO "descriptionHtml";
ALTER TABLE "Program" RENAME COLUMN "detailsJson" TO "descriptionJson";

-- Add new columns
ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "showDescription" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "showJourney" BOOLEAN NOT NULL DEFAULT false;

-- Create ProgramJourneyStage table
CREATE TABLE IF NOT EXISTS "ProgramJourneyStage" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "activities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProgramJourneyStage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProgramJourneyStage_programId_published_sortOrder_idx" 
ON "ProgramJourneyStage"("programId", "published", "sortOrder");

ALTER TABLE "ProgramJourneyStage" 
ADD CONSTRAINT "ProgramJourneyStage_programId_fkey" 
FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Fix _PartnerToProgram primary key
ALTER TABLE "_PartnerToProgram" ADD CONSTRAINT "_PartnerToProgram_AB_pkey" PRIMARY KEY ("A", "B");
DROP INDEX IF EXISTS "_PartnerToProgram_AB_unique";

-- Create Donation table
CREATE TABLE IF NOT EXISTS "Donation" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "message" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);