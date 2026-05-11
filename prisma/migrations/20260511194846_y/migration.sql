/*
  Warnings:

  - You are about to drop the column `bookingLink` on the `doctor_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctor_profile" DROP COLUMN "bookingLink",
ADD COLUMN     "bookingLinks" TEXT[];
