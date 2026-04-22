/*
  Warnings:

  - You are about to drop the column `serviceCategoryIds` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `serviceIds` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `subzoneIds` on the `doctor_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctor_profile" DROP COLUMN "serviceCategoryIds",
DROP COLUMN "serviceIds",
DROP COLUMN "subzoneIds",
ADD COLUMN     "otherSpecialtyText" TEXT,
ADD COLUMN     "serviceCategories" TEXT[],
ADD COLUMN     "services" TEXT[],
ADD COLUMN     "subzones" TEXT[];
