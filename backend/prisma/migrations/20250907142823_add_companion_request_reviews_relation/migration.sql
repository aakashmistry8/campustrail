-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN "resetTokenExpires" DATETIME;
ALTER TABLE "User" ADD COLUMN "signupOtp" TEXT;
ALTER TABLE "User" ADD COLUMN "signupOtpExpires" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "gearItemId" TEXT,
    "itineraryId" TEXT,
    "companionRequestId" TEXT,
    "targetUserId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_gearItemId_fkey" FOREIGN KEY ("gearItemId") REFERENCES "GearItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_companionRequestId_fkey" FOREIGN KEY ("companionRequestId") REFERENCES "CompanionRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("authorId", "body", "createdAt", "gearItemId", "id", "itineraryId", "rating", "targetUserId", "title", "updatedAt") SELECT "authorId", "body", "createdAt", "gearItemId", "id", "itineraryId", "rating", "targetUserId", "title", "updatedAt" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE INDEX "Review_gearItemId_idx" ON "Review"("gearItemId");
CREATE INDEX "Review_itineraryId_idx" ON "Review"("itineraryId");
CREATE INDEX "Review_companionRequestId_idx" ON "Review"("companionRequestId");
CREATE INDEX "Review_targetUserId_idx" ON "Review"("targetUserId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
