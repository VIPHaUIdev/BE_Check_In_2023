/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Email` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Email_userId_key` ON `Email`(`userId`);
