-- CreateTable
CREATE TABLE "doctor_category" (
    "doctorProfileId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_category_pkey" PRIMARY KEY ("doctorProfileId","categoryId")
);

-- CreateIndex
CREATE INDEX "doctor_category_categoryId_doctorProfileId_idx" ON "doctor_category"("categoryId", "doctorProfileId");

-- CreateIndex
CREATE INDEX "doctor_category_doctorProfileId_position_idx" ON "doctor_category"("doctorProfileId", "position");

-- AddForeignKey
ALTER TABLE "doctor_category" ADD CONSTRAINT "doctor_category_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_category" ADD CONSTRAINT "doctor_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
