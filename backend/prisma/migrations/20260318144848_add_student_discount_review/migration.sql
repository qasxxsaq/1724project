-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "discountReviewStatus" TEXT,
ALTER COLUMN "code" DROP NOT NULL;
