-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "maxCompanions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guest_email_key" ON "Guest"("email");

-- DropIndex
DROP INDEX "Rsvp_email_key";

-- AlterTable: drop old columns, add guestId
ALTER TABLE "Rsvp" DROP COLUMN "name",
DROP COLUMN "email",
DROP COLUMN "phone",
DROP COLUMN "dietaryRestrictions",
ADD COLUMN "guestId" TEXT;

-- Backfill: remove any orphan rows that have no guestId (old data)
DELETE FROM "Rsvp" WHERE "guestId" IS NULL;

-- Make guestId required
ALTER TABLE "Rsvp" ALTER COLUMN "guestId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Rsvp_guestId_key" ON "Rsvp"("guestId");

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
