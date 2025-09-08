-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "batch" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GearItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dailyRate" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GearItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GearRental" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gearItemId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "depositHeld" INTEGER NOT NULL DEFAULT 0,
    "pickupConfirmedAt" DATETIME,
    "returnConfirmedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GearRental_gearItemId_fkey" FOREIGN KEY ("gearItemId") REFERENCES "GearItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GearRental_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "maxPeople" INTEGER NOT NULL,
    "costEstimate" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Itinerary_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItineraryJoin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itineraryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PARTICIPANT',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ItineraryJoin_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItineraryJoin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanionRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "flexibility" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CompanionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GearPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gearItemId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "GearPhoto_gearItemId_fkey" FOREIGN KEY ("gearItemId") REFERENCES "GearItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItineraryInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itineraryId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "ItineraryInterest_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanionRequestInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companionRequestId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "CompanionRequestInterest_companionRequestId_fkey" FOREIGN KEY ("companionRequestId") REFERENCES "CompanionRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
