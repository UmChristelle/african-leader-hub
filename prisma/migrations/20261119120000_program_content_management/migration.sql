ALTER TABLE "Program"
  ADD COLUMN IF NOT EXISTS "objectives" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "keyActivities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "expectedOutcomes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "testimonialsHtml" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "testimonialsJson" JSONB,
  ADD COLUMN IF NOT EXISTS "showObjectives" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "showKeyActivities" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "showExpectedOutcomes" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "showTestimonials" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "backgroundHtml" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "backgroundJson" JSONB,
  ADD COLUMN IF NOT EXISTS "goalHtml" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "goalJson" JSONB,
  ADD COLUMN IF NOT EXISTS "whoServesHtml" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "whoServesJson" JSONB,
  ADD COLUMN IF NOT EXISTS "showBackground" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "showGoal" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "showWhoServes" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Program"
  ADD COLUMN IF NOT EXISTS "introductionHtml" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "showIntroduction" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "duration" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "showTimeline" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "showGallery" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "showParticipants" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "ogTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "ogDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "ogImageAssetId" TEXT;

DO $$ BEGIN
  ALTER TABLE "Program" ADD CONSTRAINT "Program_ogImageAssetId_fkey"
    FOREIGN KEY ("ogImageAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ProgramObjective" (
  "id" TEXT NOT NULL, "programId" TEXT NOT NULL, "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '', "published" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ProgramObjective_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "ProgramOutcome" (
  "id" TEXT NOT NULL, "programId" TEXT NOT NULL, "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '', "icon" TEXT NOT NULL DEFAULT '', "imageAssetId" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT true, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProgramOutcome_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "ProgramActivity" (
  "id" TEXT NOT NULL, "programId" TEXT NOT NULL, "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '', "period" TEXT NOT NULL DEFAULT '', "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3), "imageAssetId" TEXT, "published" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ProgramActivity_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "ProgramTimelinePhase" (
  "id" TEXT NOT NULL, "programId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '', "startDate" TIMESTAMP(3), "endDate" TIMESTAMP(3),
  "published" BOOLEAN NOT NULL DEFAULT true, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProgramTimelinePhase_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "ProgramTimelineMilestone" (
  "id" TEXT NOT NULL, "phaseId" TEXT NOT NULL, "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '', "date" TIMESTAMP(3), "published" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ProgramTimelineMilestone_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "ProgramTestimonial" (
  "id" TEXT NOT NULL, "programId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT '', "organization" TEXT NOT NULL DEFAULT '', "content" TEXT NOT NULL,
  "location" TEXT NOT NULL DEFAULT '', "photoAssetId" TEXT, "published" BOOLEAN NOT NULL DEFAULT true,
  "featured" BOOLEAN NOT NULL DEFAULT false, "sortOrder" INTEGER NOT NULL DEFAULT 0, "participantId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProgramTestimonial_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "ProgramParticipant" (
  "id" TEXT NOT NULL, "programId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "projectName" TEXT NOT NULL DEFAULT '', "biography" TEXT NOT NULL DEFAULT '', "location" TEXT NOT NULL DEFAULT '',
  "photoAssetId" TEXT, "published" BOOLEAN NOT NULL DEFAULT true, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProgramParticipant_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProgramGalleryImage"
  ADD COLUMN IF NOT EXISTS "caption" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "description" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "altText" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "ProgramObjective_programId_published_sortOrder_idx" ON "ProgramObjective"("programId", "published", "sortOrder");
CREATE INDEX IF NOT EXISTS "ProgramOutcome_programId_published_sortOrder_idx" ON "ProgramOutcome"("programId", "published", "sortOrder");
CREATE INDEX IF NOT EXISTS "ProgramActivity_programId_published_sortOrder_idx" ON "ProgramActivity"("programId", "published", "sortOrder");
CREATE INDEX IF NOT EXISTS "ProgramTimelinePhase_programId_published_sortOrder_idx" ON "ProgramTimelinePhase"("programId", "published", "sortOrder");
CREATE INDEX IF NOT EXISTS "ProgramTimelineMilestone_phaseId_published_sortOrder_idx" ON "ProgramTimelineMilestone"("phaseId", "published", "sortOrder");
CREATE INDEX IF NOT EXISTS "ProgramTestimonial_programId_published_featured_sortOrder_idx" ON "ProgramTestimonial"("programId", "published", "featured", "sortOrder");
CREATE INDEX IF NOT EXISTS "ProgramTestimonial_participantId_idx" ON "ProgramTestimonial"("participantId");
CREATE INDEX IF NOT EXISTS "ProgramParticipant_programId_published_sortOrder_idx" ON "ProgramParticipant"("programId", "published", "sortOrder");

-- Preserve the existing editable list content while moving it into the managed records.
INSERT INTO "ProgramObjective" ("id", "programId", "title", "published", "sortOrder", "updatedAt")
SELECT md5(p."id" || ':objective:' || item.ordinality::text), p."id", item.value, true,
       (item.ordinality - 1)::integer, CURRENT_TIMESTAMP
FROM "Program" p CROSS JOIN LATERAL unnest(p."objectives") WITH ORDINALITY AS item(value, ordinality)
WHERE btrim(item.value) <> '' ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ProgramOutcome" ("id", "programId", "title", "published", "sortOrder", "updatedAt")
SELECT md5(p."id" || ':outcome:' || item.ordinality::text), p."id", item.value, true,
       (item.ordinality - 1)::integer, CURRENT_TIMESTAMP
FROM "Program" p CROSS JOIN LATERAL unnest(p."expectedOutcomes") WITH ORDINALITY AS item(value, ordinality)
WHERE btrim(item.value) <> '' ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ProgramActivity" ("id", "programId", "title", "published", "sortOrder", "updatedAt")
SELECT md5(p."id" || ':activity:' || item.ordinality::text), p."id", item.value, true,
       (item.ordinality - 1)::integer, CURRENT_TIMESTAMP
FROM "Program" p CROSS JOIN LATERAL unnest(p."keyActivities") WITH ORDINALITY AS item(value, ordinality)
WHERE btrim(item.value) <> '' ON CONFLICT ("id") DO NOTHING;

DO $$ BEGIN
  ALTER TABLE "ProgramObjective" ADD CONSTRAINT "ProgramObjective_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "ProgramOutcome" ADD CONSTRAINT "ProgramOutcome_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "ProgramOutcome" ADD CONSTRAINT "ProgramOutcome_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  ALTER TABLE "ProgramActivity" ADD CONSTRAINT "ProgramActivity_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "ProgramActivity" ADD CONSTRAINT "ProgramActivity_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  ALTER TABLE "ProgramTimelinePhase" ADD CONSTRAINT "ProgramTimelinePhase_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "ProgramTimelineMilestone" ADD CONSTRAINT "ProgramTimelineMilestone_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ProgramTimelinePhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "ProgramTestimonial" ADD CONSTRAINT "ProgramTestimonial_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "ProgramTestimonial" ADD CONSTRAINT "ProgramTestimonial_photoAssetId_fkey" FOREIGN KEY ("photoAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  ALTER TABLE "ProgramTestimonial" ADD CONSTRAINT "ProgramTestimonial_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ProgramParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  ALTER TABLE "ProgramParticipant" ADD CONSTRAINT "ProgramParticipant_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "ProgramParticipant" ADD CONSTRAINT "ProgramParticipant_photoAssetId_fkey" FOREIGN KEY ("photoAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
