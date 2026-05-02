/*
  Warnings:

  - Added the required column `clinicName` to the `doctor_profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workAddress` to the `doctor_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "doctor_profile" ADD COLUMN     "city" TEXT,
ADD COLUMN     "clinicName" TEXT NOT NULL,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "googlePlaceId" TEXT,
ADD COLUMN     "workAddress" TEXT NOT NULL,
ADD COLUMN     "workLatitude" DOUBLE PRECISION,
ADD COLUMN     "workLongitude" DOUBLE PRECISION,
ADD COLUMN     "zipCode" TEXT;
