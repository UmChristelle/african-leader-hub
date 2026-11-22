DO $$ BEGIN
  CREATE TYPE "ParticipantGoalStatus" AS ENUM ('NOT_REVIEWED', 'IN_PROGRESS', 'ACHIEVED', 'PAUSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "ProgramObjective"
  ADD COLUMN IF NOT EXISTS "theme" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProgramActivity"
  ADD COLUMN IF NOT EXISTS "theme" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProgramParticipant"
  ADD COLUMN IF NOT EXISTS "businessDescription" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "sector" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "socialMedia" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "challengesBefore" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "achievements" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProgramTestimonial"
  ADD COLUMN IF NOT EXISTS "storyTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "excerpt" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "slug" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "ProgramTestimonial_slug_key" ON "ProgramTestimonial"("slug");

CREATE TABLE IF NOT EXISTS "ProgramParticipantGoal" (
  "id" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "status" "ParticipantGoalStatus" NOT NULL DEFAULT 'NOT_REVIEWED',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "achievementNotes" TEXT NOT NULL DEFAULT '',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProgramParticipantGoal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProgramParticipantUpdate" (
  "id" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "progressDescription" TEXT NOT NULL DEFAULT '',
  "achievements" TEXT NOT NULL DEFAULT '',
  "challenges" TEXT NOT NULL DEFAULT '',
  "nextSteps" TEXT NOT NULL DEFAULT '',
  "internalNotes" TEXT NOT NULL DEFAULT '',
  "attachmentAssetId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProgramParticipantUpdate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProgramParticipantGoal_participantId_sortOrder_idx"
  ON "ProgramParticipantGoal"("participantId", "sortOrder");
CREATE INDEX IF NOT EXISTS "ProgramParticipantGoal_participantId_status_idx"
  ON "ProgramParticipantGoal"("participantId", "status");
CREATE INDEX IF NOT EXISTS "ProgramParticipantUpdate_participantId_occurredAt_idx"
  ON "ProgramParticipantUpdate"("participantId", "occurredAt");

DO $$ BEGIN
  ALTER TABLE "ProgramParticipantGoal" ADD CONSTRAINT "ProgramParticipantGoal_participantId_fkey"
    FOREIGN KEY ("participantId") REFERENCES "ProgramParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ProgramParticipantUpdate" ADD CONSTRAINT "ProgramParticipantUpdate_participantId_fkey"
    FOREIGN KEY ("participantId") REFERENCES "ProgramParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ProgramParticipantUpdate" ADD CONSTRAINT "ProgramParticipantUpdate_attachmentAssetId_fkey"
    FOREIGN KEY ("attachmentAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Classify only existing AHEZA content, using its actual wording. Empty themes remain admin-editable.
UPDATE "ProgramObjective" SET "theme" = 'Financial capability'
WHERE "theme" = '' AND "title" IN (
  'Improve financial record-keeping and business financial management.',
  'Improve participants'' understanding of pricing, costs, stock, savings, and profitability.'
);
UPDATE "ProgramObjective" SET "theme" = 'Markets and customers'
WHERE "theme" = '' AND "title" IN (
  'Help entrepreneurs understand their customers, markets, competitors, and value propositions.',
  'Develop marketing, communication, and customer acquisition skills.'
);
UPDATE "ProgramObjective" SET "theme" = 'Planning and business models'
WHERE "theme" = '' AND "title" IN (
  'Strengthen business planning, goal-setting, and decision-making.',
  'Support the development and refinement of viable business models and offers.'
);
UPDATE "ProgramObjective" SET "theme" = 'Learning and growth'
WHERE "theme" = '' AND "title" IN (
  'Encourage learning, networking, and experience-sharing among participants.',
  'Help participants prepare clear business presentations and pitches.'
);

UPDATE "ProgramActivity" SET "theme" = 'Discover'
WHERE "theme" = '' AND "title" IN (
  'Clarification and assessment of business ideas.',
  'Feasibility studies and market research.',
  'Customer profiling and customer acquisition strategies.'
);
UPDATE "ProgramActivity" SET "theme" = 'Design'
WHERE "theme" = '' AND "title" IN (
  'Value proposition development.',
  'Business Model Canvas development and refinement.',
  'Offer and sales strategy development.'
);
UPDATE "ProgramActivity" SET "theme" = 'Build'
WHERE "theme" = '' AND "title" IN (
  'Practical training in Excel and Google Sheets for business records.',
  'Accounting fundamentals: income and expense tracking.',
  'Communication and business visibility.',
  'Introduction to basic legal and regulatory considerations.'
);
UPDATE "ProgramActivity" SET "theme" = 'Present and grow'
WHERE "theme" = '' AND "title" IN (
  'Prototype refinement and presentation preparation.',
  'Pitch preparation and business presentation.'
);
UPDATE "ProgramActivity" SET "theme" = 'Mentorship'
WHERE "theme" = '' AND "title" = 'One-to-one mentoring sessions tailored to each participant''s business.';
