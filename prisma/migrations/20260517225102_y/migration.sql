/*
  Warnings:

  - You are about to drop the column `procedureId` on the `BeforeAfterCase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BeforeAfterCase" DROP COLUMN "procedureId",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "procedure" TEXT;
