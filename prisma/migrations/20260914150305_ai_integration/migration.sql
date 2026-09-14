/*
  Warnings:

  - You are about to drop the `procedure_embedding` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "procedure_embedding" DROP CONSTRAINT "procedure_embedding_procedureId_fkey";

-- DropTable
DROP TABLE "procedure_embedding";
