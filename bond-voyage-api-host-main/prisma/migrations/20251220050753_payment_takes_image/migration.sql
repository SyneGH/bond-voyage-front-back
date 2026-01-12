/*
  Warnings:

  - You are about to drop the column `proofUrl` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "proofUrl",
ADD COLUMN     "proofImage" BYTEA,
ADD COLUMN     "proofMimeType" TEXT,
ADD COLUMN     "proofSize" INTEGER;
