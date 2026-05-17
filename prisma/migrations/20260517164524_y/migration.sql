-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'MIXED');

-- AlterTable
ALTER TABLE "message" ADD COLUMN     "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
ALTER COLUMN "ciphertext" DROP NOT NULL,
ALTER COLUMN "iv" DROP NOT NULL;

-- CreateTable
CREATE TABLE "message_attachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "uploadedByUserId" TEXT NOT NULL,
    "objectPath" TEXT NOT NULL,
    "fileName" TEXT,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_attachment_messageId_idx" ON "message_attachment"("messageId");

-- CreateIndex
CREATE INDEX "message_attachment_conversationId_idx" ON "message_attachment"("conversationId");

-- CreateIndex
CREATE INDEX "message_attachment_uploadedByUserId_idx" ON "message_attachment"("uploadedByUserId");

-- AddForeignKey
ALTER TABLE "message_attachment" ADD CONSTRAINT "message_attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachment" ADD CONSTRAINT "message_attachment_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachment" ADD CONSTRAINT "message_attachment_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
