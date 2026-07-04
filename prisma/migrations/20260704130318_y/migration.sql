-- CreateTable
CREATE TABLE "instagram_reel" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instagram_reel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instagram_reel_url_key" ON "instagram_reel"("url");

-- CreateIndex
CREATE INDEX "instagram_reel_sortOrder_idx" ON "instagram_reel"("sortOrder");
