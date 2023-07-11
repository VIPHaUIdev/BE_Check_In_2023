/*
  Warnings:

  - You are about to drop the column `fullname` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `studentCode` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fullName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `generation` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `fullname`,
    DROP COLUMN `phone`,
    DROP COLUMN `studentCode`,
    ADD COLUMN `fullName` VARCHAR(191) NOT NULL,
    ADD COLUMN `generation` VARCHAR(191) NOT NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_phoneNumber_key` ON `users`(`phoneNumber`);
