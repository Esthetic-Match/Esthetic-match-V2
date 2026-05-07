/*
  Warnings:

  - You are about to drop the column `SocialMediaLink` on the `doctor_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctor_profile" DROP COLUMN "SocialMediaLink",
ADD COLUMN     "bookingLink" TEXT,
ADD COLUMN     "socialMediaLink" TEXT;
