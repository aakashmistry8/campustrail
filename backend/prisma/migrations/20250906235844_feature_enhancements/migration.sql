-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rentalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "providerRef" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "GearRental" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RentalDispute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rentalId" TEXT NOT NULL,
    "raisedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolutionNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RentalDispute_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "GearRental" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RentalDispute_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "gearItemId" TEXT,
    "itineraryId" TEXT,
    "targetUserId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_gearItemId_fkey" FOREIGN KEY ("gearItemId") REFERENCES "GearItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GearItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dailyRate" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "bufferHours" INTEGER NOT NULL DEFAULT 12,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GearItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GearItem" ("condition", "createdAt", "dailyRate", "depositAmount", "description", "id", "ownerId", "title", "updatedAt") SELECT "condition", "createdAt", "dailyRate", "depositAmount", "description", "id", "ownerId", "title", "updatedAt" FROM "GearItem";
DROP TABLE "GearItem";
ALTER TABLE "new_GearItem" RENAME TO "GearItem";
CREATE TABLE "new_GearRental" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gearItemId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "depositHeld" INTEGER NOT NULL DEFAULT 0,
    "depositStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "pickupConfirmedAt" DATETIME,
    "returnConfirmedAt" DATETIME,
    "rentalMode" TEXT NOT NULL DEFAULT 'DAY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GearRental_gearItemId_fkey" FOREIGN KEY ("gearItemId") REFERENCES "GearItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GearRental_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GearRental" ("createdAt", "depositHeld", "endDate", "gearItemId", "id", "pickupConfirmedAt", "renterId", "returnConfirmedAt", "startDate", "status", "updatedAt") SELECT "createdAt", "depositHeld", "endDate", "gearItemId", "id", "pickupConfirmedAt", "renterId", "returnConfirmedAt", "startDate", "status", "updatedAt" FROM "GearRental";
DROP TABLE "GearRental";
ALTER TABLE "new_GearRental" RENAME TO "GearRental";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Review_gearItemId_idx" ON "Review"("gearItemId");

-- CreateIndex
CREATE INDEX "Review_itineraryId_idx" ON "Review"("itineraryId");

-- CreateIndex
CREATE INDEX "Review_targetUserId_idx" ON "Review"("targetUserId");
