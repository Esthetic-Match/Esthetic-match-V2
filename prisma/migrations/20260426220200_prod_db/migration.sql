/*
  Warnings:

  - You are about to drop the column `serviceCategories` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `services` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `specialties` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `subzones` on the `doctor_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctor_profile" DROP COLUMN "serviceCategories",
DROP COLUMN "services",
DROP COLUMN "specialties",
DROP COLUMN "subzones",
ADD COLUMN     "procedureIds" TEXT[],
ADD COLUMN     "specialtyIds" TEXT[],
ADD COLUMN     "subcategoryIds" TEXT[],
ADD COLUMN     "subzoneIds" TEXT[];
