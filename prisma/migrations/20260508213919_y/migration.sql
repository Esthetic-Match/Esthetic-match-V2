-- AlterTable
ALTER TABLE "doctor_profile" ADD COLUMN     "googleMapsUri" TEXT,
ADD COLUMN     "googleRating" DOUBLE PRECISION,
ADD COLUMN     "googleReviewCount" INTEGER;
