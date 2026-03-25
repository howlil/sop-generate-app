/*
  Warnings:

  - You are about to drop the column `jabatan` on the `tteprofile` table. All the data in the column will be lost.
  - You are about to drop the column `nip` on the `tteprofile` table. All the data in the column will be lost.
  - You are about to drop the column `nohp` on the `tteprofile` table. All the data in the column will be lost.
  - You are about to drop the column `pangkat` on the `tteprofile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `SOP` ADD COLUMN `picUserId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `TTEProfile` DROP COLUMN `jabatan`,
    DROP COLUMN `nip`,
    DROP COLUMN `nohp`,
    DROP COLUMN `pangkat`;

-- AddForeignKey
ALTER TABLE `SOP` ADD CONSTRAINT `SOP_picUserId_fkey` FOREIGN KEY (`picUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
