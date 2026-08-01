-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MissionStatus') THEN
        CREATE TYPE "MissionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PriorityLevel') THEN
        CREATE TYPE "PriorityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
    END IF;
END $$;

-- AlterTable: Add archive columns
ALTER TABLE "missions" ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "missions" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(6);

-- Convert status column to MissionStatus enum safely
ALTER TABLE "missions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "missions" ALTER COLUMN "status" TYPE "MissionStatus" USING (
  CASE 
    WHEN LOWER("status"::text) = 'completed' THEN 'COMPLETED'::"MissionStatus"
    WHEN LOWER("status"::text) = 'archived' THEN 'ARCHIVED'::"MissionStatus"
    ELSE 'ACTIVE'::"MissionStatus"
  END
);
ALTER TABLE "missions" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"MissionStatus";

-- Convert priority column to PriorityLevel enum safely
ALTER TABLE "missions" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "missions" ALTER COLUMN "priority" TYPE "PriorityLevel" USING (
  CASE 
    WHEN LOWER("priority"::text) = 'low' THEN 'LOW'::"PriorityLevel"
    WHEN LOWER("priority"::text) = 'high' THEN 'HIGH'::"PriorityLevel"
    WHEN LOWER("priority"::text) = 'urgent' THEN 'URGENT'::"PriorityLevel"
    ELSE 'MEDIUM'::"PriorityLevel"
  END
);
ALTER TABLE "missions" ALTER COLUMN "priority" SET DEFAULT 'MEDIUM'::"PriorityLevel";

-- Create required indexes
CREATE INDEX IF NOT EXISTS "missions_user_id_idx" ON "missions"("user_id");
CREATE INDEX IF NOT EXISTS "missions_user_id_status_idx" ON "missions"("user_id", "status");
CREATE INDEX IF NOT EXISTS "missions_user_id_priority_idx" ON "missions"("user_id", "priority");
CREATE INDEX IF NOT EXISTS "missions_user_id_category_idx" ON "missions"("user_id", "category");
CREATE INDEX IF NOT EXISTS "missions_user_id_target_date_idx" ON "missions"("user_id", "target_date");

-- Add date validation constraint if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'missions_dates_check') THEN
        ALTER TABLE "missions" ADD CONSTRAINT "missions_dates_check" CHECK (target_date IS NULL OR start_date IS NULL OR target_date >= start_date);
    END IF;
END $$;
