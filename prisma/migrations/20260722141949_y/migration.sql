/*
  Warnings:

  - You are about to drop the column `socialMediaLink` on the `doctor_profile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SocialMediaPlatform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE', 'LINKEDIN', 'X', 'SNAPCHAT', 'WEBSITE', 'OTHER');

-- AlterTable
ALTER TABLE "doctor_profile" DROP COLUMN "socialMediaLink";

-- CreateTable
CREATE TABLE "doctor_social_media" (
    "id" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "platform" "SocialMediaPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "username" TEXT,
    "label" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_social_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "doctor_social_media_doctorProfileId_idx" ON "doctor_social_media"("doctorProfileId");

-- CreateIndex
CREATE INDEX "doctor_social_media_doctorProfileId_isVisible_sortOrder_idx" ON "doctor_social_media"("doctorProfileId", "isVisible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_social_media_doctorProfileId_platform_url_key" ON "doctor_social_media"("doctorProfileId", "platform", "url");

-- AddForeignKey
ALTER TABLE "doctor_social_media" ADD CONSTRAINT "doctor_social_media_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
