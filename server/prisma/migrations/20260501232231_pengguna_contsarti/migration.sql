-- AddForeignKey
ALTER TABLE `RiwayatOpdPengguna` ADD CONSTRAINT `RiwayatOpdPengguna_penggunaId_fkey` FOREIGN KEY (`penggunaId`) REFERENCES `Pengguna`(`penggunaId`) ON DELETE CASCADE ON UPDATE CASCADE;
