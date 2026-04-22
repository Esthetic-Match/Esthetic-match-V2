/*
  Warnings:

  - You are about to drop the column `otherSpecialtyText` on the `doctor_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctor_profile" DROP COLUMN "otherSpecialtyText",
ADD COLUMN     "serviceCategoryIds" TEXT[],
ADD COLUMN     "serviceIds" TEXT[],
ADD COLUMN     "subzoneIds" TEXT[];
