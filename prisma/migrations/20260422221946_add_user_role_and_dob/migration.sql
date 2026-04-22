/*
  Warnings:

  - Added the required column `role` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'DOCTOR');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "role" "UserRole" NOT NULL;

-- CreateTable
CREATE TABLE "patient_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_profile_userId_key" ON "patient_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profile_userId_key" ON "doctor_profile"("userId");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- AddForeignKey
ALTER TABLE "patient_profile" ADD CONSTRAINT "patient_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_profile" ADD CONSTRAINT "doctor_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
