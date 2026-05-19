/*
  Warnings:

  - You are about to drop the column `Favorite` on the `patient_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "patient_profile" DROP COLUMN "Favorite",
ADD COLUMN     "favorite" TEXT[];
