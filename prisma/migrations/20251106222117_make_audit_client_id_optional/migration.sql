-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_audit_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ts" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL,
    "client_id" TEXT,
    "action" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    CONSTRAINT "audit_events_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("client_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_audit_events" ("action", "actor", "client_id", "id", "meta", "ts") SELECT "action", "actor", "client_id", "id", "meta", "ts" FROM "audit_events";
DROP TABLE "audit_events";
ALTER TABLE "new_audit_events" RENAME TO "audit_events";
CREATE INDEX "audit_events_client_id_idx" ON "audit_events"("client_id");
CREATE INDEX "audit_events_actor_idx" ON "audit_events"("actor");
CREATE INDEX "audit_events_ts_idx" ON "audit_events"("ts");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
