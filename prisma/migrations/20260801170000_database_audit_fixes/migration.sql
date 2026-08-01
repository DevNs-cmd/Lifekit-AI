-- Create Opportunities Table
CREATE TABLE IF NOT EXISTS "opportunities" (
    "opportunity_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100),
    "source_url" TEXT,
    "status" VARCHAR(50) DEFAULT 'OPEN',
    "match_score" DECIMAL(5,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("opportunity_id")
);

-- Create Subscriptions Table
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "subscription_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plan_name" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'ACTIVE',
    "amount" DECIMAL(10,2),
    "billing_cycle" VARCHAR(50) DEFAULT 'MONTHLY',
    "start_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("subscription_id")
);

-- Foreign Keys for Opportunities and Subscriptions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_opportunities_user') THEN
        ALTER TABLE "opportunities" ADD CONSTRAINT "fk_opportunities_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_subscriptions_user') THEN
        ALTER TABLE "subscriptions" ADD CONSTRAINT "fk_subscriptions_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

-- Update FK constraints on payments & transactions to Restrict historical deletion
DO $$
BEGIN
    -- Drop old cascade FK on payments if exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_transaction_id_fkey') THEN
        ALTER TABLE "payments" DROP CONSTRAINT "payments_transaction_id_fkey";
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_transaction') THEN
        ALTER TABLE "payments" ADD CONSTRAINT "fk_payments_transaction" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("transaction_id") ON DELETE RESTRICT ON UPDATE NO ACTION;
    END IF;

    -- Update transactions FK on user if cascade
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_transaction_user') THEN
        ALTER TABLE "transactions" DROP CONSTRAINT "fk_transaction_user";
        ALTER TABLE "transactions" ADD CONSTRAINT "fk_transaction_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE NO ACTION;
    END IF;
END $$;

-- Create Performance Indexes Across All Models
CREATE INDEX IF NOT EXISTS "tasks_mission_id_idx" ON "tasks"("mission_id");
CREATE INDEX IF NOT EXISTS "tasks_mission_id_status_idx" ON "tasks"("mission_id", "status");
CREATE INDEX IF NOT EXISTS "tasks_status_idx" ON "tasks"("status");
CREATE INDEX IF NOT EXISTS "tasks_created_at_idx" ON "tasks"("created_at");

CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at");

CREATE INDEX IF NOT EXISTS "opportunities_user_id_idx" ON "opportunities"("user_id");
CREATE INDEX IF NOT EXISTS "opportunities_user_id_status_idx" ON "opportunities"("user_id", "status");
CREATE INDEX IF NOT EXISTS "opportunities_category_idx" ON "opportunities"("category");
CREATE INDEX IF NOT EXISTS "opportunities_created_at_idx" ON "opportunities"("created_at");

CREATE INDEX IF NOT EXISTS "subscriptions_user_id_idx" ON "subscriptions"("user_id");
CREATE INDEX IF NOT EXISTS "subscriptions_user_id_status_idx" ON "subscriptions"("user_id", "status");
CREATE INDEX IF NOT EXISTS "subscriptions_end_date_idx" ON "subscriptions"("end_date");

CREATE INDEX IF NOT EXISTS "transactions_user_id_idx" ON "transactions"("user_id");
CREATE INDEX IF NOT EXISTS "transactions_service_id_idx" ON "transactions"("service_id");
CREATE INDEX IF NOT EXISTS "transactions_user_id_transaction_date_idx" ON "transactions"("user_id", "transaction_date");

CREATE INDEX IF NOT EXISTS "payments_transaction_id_idx" ON "payments"("transaction_id");
CREATE INDEX IF NOT EXISTS "payments_payment_reference_idx" ON "payments"("payment_reference");

CREATE INDEX IF NOT EXISTS "journals_user_id_idx" ON "journals"("user_id");
CREATE INDEX IF NOT EXISTS "journals_user_id_created_at_idx" ON "journals"("user_id", "created_at");

CREATE INDEX IF NOT EXISTS "journal_images_journal_id_idx" ON "journal_images"("journal_id");

CREATE INDEX IF NOT EXISTS "ai_memory_user_id_idx" ON "ai_memory"("user_id");
CREATE INDEX IF NOT EXISTS "ai_memory_user_id_memory_type_idx" ON "ai_memory"("user_id", "memory_type");

CREATE INDEX IF NOT EXISTS "goals_user_id_idx" ON "goals"("user_id");
CREATE INDEX IF NOT EXISTS "goals_user_id_status_idx" ON "goals"("user_id", "status");

CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_table_name_record_id_idx" ON "audit_logs"("table_name", "record_id");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at");

CREATE INDEX IF NOT EXISTS "marketplace_category_idx" ON "marketplace"("category");
CREATE INDEX IF NOT EXISTS "marketplace_rating_idx" ON "marketplace"("rating");

CREATE INDEX IF NOT EXISTS "interests_user_id_idx" ON "interests"("user_id");
CREATE INDEX IF NOT EXISTS "preferences_user_id_idx" ON "preferences"("user_id");
CREATE INDEX IF NOT EXISTS "profiles_user_id_idx" ON "profiles"("user_id");
CREATE INDEX IF NOT EXISTS "skills_user_id_idx" ON "skills"("user_id");
CREATE INDEX IF NOT EXISTS "templates_category_idx" ON "templates"("category");
