CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "procedure_embedding" (
  "procedureId" TEXT PRIMARY KEY,
  "content" TEXT NOT NULL,
  "embedding" vector(1536) NOT NULL,
  "embeddingModel" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "procedure_embedding_procedureId_fkey"
    FOREIGN KEY ("procedureId")
    REFERENCES "procedure"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX "procedure_embedding_embedding_idx"
ON "procedure_embedding"
USING hnsw ("embedding" vector_cosine_ops);