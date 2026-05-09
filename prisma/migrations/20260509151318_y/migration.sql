-- CreateEnum
CREATE TYPE "ConsultationType" AS ENUM ('IN_CLINIC', 'ONLINE');

-- AlterTable
ALTER TABLE "patient_profile" ADD COLUMN     "address" TEXT,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "googlePlaceId" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "preferredConsultationType" TEXT,
ADD COLUMN     "preferredLanguage" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "zipCode" TEXT;
