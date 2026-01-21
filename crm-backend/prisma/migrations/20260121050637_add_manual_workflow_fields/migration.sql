/*
  Warnings:

  - Added the required column `data` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('Approved', 'Rejected', 'Discom_Pending');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Complete', 'Hold', 'Payment_Slip_Uploaded', 'Other');

-- CreateEnum
CREATE TYPE "AllotmentStatus" AS ENUM ('Received', 'Pending');

-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('Pending', 'Completed');

-- CreateEnum
CREATE TYPE "NtpStatus" AS ENUM ('Received', 'Not_Received');

-- CreateEnum
CREATE TYPE "AifStatus" AS ENUM ('Done', 'Pending');

-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('Pending', 'Material_Dispatched', 'Work_Complete');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "data" BYTEA NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
ADD COLUMN     "size" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "aifStatus" "AifStatus",
ADD COLUMN     "allotmentStatus" "AllotmentStatus",
ADD COLUMN     "approvalStatus" "ApprovalStatus",
ADD COLUMN     "bankAccountOpen" BOOLEAN,
ADD COLUMN     "cifStatus" BOOLEAN,
ADD COLUMN     "connectionType" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "hp" TEXT,
ADD COLUMN     "meterSerialNo" TEXT,
ADD COLUMN     "ntpStatus" "NtpStatus",
ADD COLUMN     "panelSerialNo" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus",
ADD COLUMN     "surveyStatus" "SurveyStatus",
ADD COLUMN     "tehsil" TEXT,
ADD COLUMN     "village" TEXT,
ADD COLUMN     "workStatus" "WorkStatus";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
