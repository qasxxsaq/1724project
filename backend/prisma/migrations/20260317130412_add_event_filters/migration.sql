-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "discountApplied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "purchasePrice" INTEGER NOT NULL DEFAULT 20;
