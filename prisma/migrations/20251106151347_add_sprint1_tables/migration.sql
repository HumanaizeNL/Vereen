/*
  Warnings:

  - You are about to drop the column `source` on the `evidence_links` table. All the data in the column will be lost.
  - Added the required column `source_id` to the `evidence_links` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source_type` to the `evidence_links` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "meerzorg_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "client_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "form_data" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '2026',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "submitted_at" DATETIME,
    "submitted_by" TEXT,
    CONSTRAINT "meerzorg_applications_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("client_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meerzorg_form_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "application_id" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_value" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meerzorg_form_data_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "meerzorg_applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "normative_checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "application_id" TEXT,
    "client_id" TEXT NOT NULL,
    "check_type" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "checked_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "normative_checks_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "meerzorg_applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "normative_checks_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("client_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "review_workflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "application_id" TEXT NOT NULL,
    "reviewer_role" TEXT NOT NULL,
    "reviewer_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comments" TEXT,
    "reviewed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "review_workflow_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "meerzorg_applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "trend_monitoring" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "client_id" TEXT NOT NULL,
    "metric_type" TEXT NOT NULL,
    "metric_value" REAL NOT NULL,
    "period_start" TEXT NOT NULL,
    "period_end" TEXT NOT NULL,
    "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trend_monitoring_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("client_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "risk_flags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "client_id" TEXT NOT NULL,
    "flag_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "flagged_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" DATETIME,
    "resolved_by" TEXT,
    CONSTRAINT "risk_flags_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("client_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "md_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "client_id" TEXT NOT NULL,
    "reviewer_name" TEXT NOT NULL,
    "reviewer_role" TEXT NOT NULL,
    "clinical_notes" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "observation_period_days" INTEGER,
    "reviewed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "md_reviews_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("client_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "framework_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "framework_type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "effective_from" TEXT NOT NULL,
    "effective_to" TEXT,
    "rules_json" TEXT NOT NULL,
    "template_path" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_evidence_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "client_id" TEXT NOT NULL,
    "target_path" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "snippet" TEXT NOT NULL,
    "relevance" REAL NOT NULL DEFAULT 0.0,
    "confidence" REAL NOT NULL DEFAULT 0.0,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "evidence_links_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("client_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_evidence_links" ("client_id", "created_at", "created_by", "id", "snippet", "target_path") SELECT "client_id", "created_at", "created_by", "id", "snippet", "target_path" FROM "evidence_links";
DROP TABLE "evidence_links";
ALTER TABLE "new_evidence_links" RENAME TO "evidence_links";
CREATE INDEX "evidence_links_client_id_idx" ON "evidence_links"("client_id");
CREATE INDEX "evidence_links_target_path_idx" ON "evidence_links"("target_path");
CREATE INDEX "evidence_links_source_type_idx" ON "evidence_links"("source_type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "meerzorg_applications_client_id_idx" ON "meerzorg_applications"("client_id");

-- CreateIndex
CREATE INDEX "meerzorg_applications_status_idx" ON "meerzorg_applications"("status");

-- CreateIndex
CREATE INDEX "meerzorg_form_data_application_id_idx" ON "meerzorg_form_data"("application_id");

-- CreateIndex
CREATE INDEX "meerzorg_form_data_field_name_idx" ON "meerzorg_form_data"("field_name");

-- CreateIndex
CREATE INDEX "normative_checks_application_id_idx" ON "normative_checks"("application_id");

-- CreateIndex
CREATE INDEX "normative_checks_client_id_idx" ON "normative_checks"("client_id");

-- CreateIndex
CREATE INDEX "normative_checks_status_idx" ON "normative_checks"("status");

-- CreateIndex
CREATE INDEX "review_workflow_application_id_idx" ON "review_workflow"("application_id");

-- CreateIndex
CREATE INDEX "review_workflow_status_idx" ON "review_workflow"("status");

-- CreateIndex
CREATE INDEX "trend_monitoring_client_id_idx" ON "trend_monitoring"("client_id");

-- CreateIndex
CREATE INDEX "trend_monitoring_metric_type_idx" ON "trend_monitoring"("metric_type");

-- CreateIndex
CREATE INDEX "trend_monitoring_recorded_at_idx" ON "trend_monitoring"("recorded_at");

-- CreateIndex
CREATE INDEX "risk_flags_client_id_idx" ON "risk_flags"("client_id");

-- CreateIndex
CREATE INDEX "risk_flags_severity_idx" ON "risk_flags"("severity");

-- CreateIndex
CREATE INDEX "risk_flags_flagged_at_idx" ON "risk_flags"("flagged_at");

-- CreateIndex
CREATE INDEX "md_reviews_client_id_idx" ON "md_reviews"("client_id");

-- CreateIndex
CREATE INDEX "md_reviews_decision_idx" ON "md_reviews"("decision");

-- CreateIndex
CREATE INDEX "framework_versions_framework_type_idx" ON "framework_versions"("framework_type");

-- CreateIndex
CREATE UNIQUE INDEX "framework_versions_framework_type_version_key" ON "framework_versions"("framework_type", "version");
