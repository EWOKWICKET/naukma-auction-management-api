/*
  Warnings:

  - You are about to drop the column `imagePublicId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `avatarPublicId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "imagePublicId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarPublicId",
DROP COLUMN "passwordResetExpiry",
DROP COLUMN "passwordResetToken";
