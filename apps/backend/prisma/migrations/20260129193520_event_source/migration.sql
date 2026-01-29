/*
  Warnings:

  - Changed the type of `causedBy` on the `order_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrderEventSource" AS ENUM ('USER', 'SYSTEM', 'PAYMENT_GATEWAY');

-- AlterTable
ALTER TABLE "order_events" DROP COLUMN "causedBy",
ADD COLUMN     "causedBy" "OrderEventSource" NOT NULL;

-- DropEnum
DROP TYPE "EventSource";
