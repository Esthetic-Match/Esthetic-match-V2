/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `doctor_profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "doctor_profile" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profile_slug_key" ON "doctor_profile"("slug");
