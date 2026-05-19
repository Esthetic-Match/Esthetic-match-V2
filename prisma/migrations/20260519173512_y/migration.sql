/*
  Warnings:

  - You are about to drop the column `notes` on the `patient_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "patient_profile" DROP COLUMN "notes",
ADD COLUMN     "Favorite" TEXT[];
