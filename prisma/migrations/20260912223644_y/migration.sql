/*
  Warnings:

  - You are about to drop the column `procedure` on the `BeforeAfterCase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BeforeAfterCase" DROP COLUMN "procedure",
ADD COLUMN     "procedureId" TEXT;

-- CreateIndex
CREATE INDEX "BeforeAfterCase_procedureId_idx" ON "BeforeAfterCase"("procedureId");

-- AddForeignKey
ALTER TABLE "BeforeAfterCase" ADD CONSTRAINT "BeforeAfterCase_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
