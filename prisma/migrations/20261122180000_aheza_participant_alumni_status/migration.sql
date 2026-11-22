DO $$ BEGIN
  CREATE TYPE "ParticipantStatus" AS ENUM ('ONGOING', 'ALUMNI');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "ProgramParticipant"
  ADD COLUMN IF NOT EXISTS "status" "ParticipantStatus" NOT NULL DEFAULT 'ONGOING';
