-- CreateTable
CREATE TABLE "procedure_embedding" (
    "procedureId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "embeddingModel" TEXT NOT NULL,
    "embedding" vector NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_embedding_pkey" PRIMARY KEY ("procedureId")
);

-- AddForeignKey
ALTER TABLE "procedure_embedding" ADD CONSTRAINT "procedure_embedding_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
