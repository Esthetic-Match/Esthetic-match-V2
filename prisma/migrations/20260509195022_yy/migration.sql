-- CreateTable
CREATE TABLE "BeforeAfterCase" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT,
    "procedureId" TEXT,
    "title" TEXT,
    "beforeImage" TEXT,
    "afterImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeforeAfterCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BeforeAfterCase_doctorId_idx" ON "BeforeAfterCase"("doctorId");

-- CreateIndex
CREATE INDEX "BeforeAfterCase_patientId_idx" ON "BeforeAfterCase"("patientId");
