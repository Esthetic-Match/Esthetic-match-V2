-- AlterTable
ALTER TABLE "instagram_reel" ADD COLUMN     "doctorProfileId" TEXT;

-- CreateIndex
CREATE INDEX "instagram_reel_doctorProfileId_idx" ON "instagram_reel"("doctorProfileId");

-- CreateIndex
CREATE INDEX "instagram_reel_doctorProfileId_sortOrder_idx" ON "instagram_reel"("doctorProfileId", "sortOrder");

-- AddForeignKey
ALTER TABLE "instagram_reel" ADD CONSTRAINT "instagram_reel_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
