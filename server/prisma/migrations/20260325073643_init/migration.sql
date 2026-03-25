-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('BIRO_ORGANISASI', 'TIM_EVALUASI', 'TIM_PENYUSUN', 'KEPALA_OPD') NOT NULL,
    `opdId` VARCHAR(191) NULL,
    `nip` VARCHAR(191) NULL,
    `jabatan` VARCHAR(191) NULL,
    `pangkat` VARCHAR(191) NULL,
    `nohp` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_opdId_idx`(`opdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OPD` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `kode` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OPD_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Peraturan` (
    `id` VARCHAR(191) NOT NULL,
    `nomor` VARCHAR(191) NOT NULL,
    `tahun` INTEGER NOT NULL,
    `tentang` TEXT NOT NULL,
    `status` ENUM('BERLAKU', 'DICABUT') NOT NULL DEFAULT 'BERLAKU',
    `version` INTEGER NOT NULL DEFAULT 1,
    `fileUrl` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Peraturan_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SOP` (
    `id` VARCHAR(191) NOT NULL,
    `nomorSOP` VARCHAR(191) NULL,
    `judul` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SEDANG_DISUSUN', 'SIAP_DIEVALUASI', 'DIAJUKAN_EVALUASI', 'SEDANG_DIEVALUASI', 'REVISI_DARI_TIM_EVALUASI', 'SIAP_DIVERIFIKASI', 'DIVERIFIKASI_BIRO_ORGANISASI', 'BERLAKU', 'DICABUT') NOT NULL DEFAULT 'DRAFT',
    `opdId` VARCHAR(191) NOT NULL,
    `peraturanId` VARCHAR(191) NULL,
    `versi` INTEGER NOT NULL DEFAULT 1,
    `picUserId` VARCHAR(191) NULL,
    `picName` VARCHAR(191) NULL,
    `picNumber` VARCHAR(191) NULL,
    `picRole` VARCHAR(191) NULL,
    `section` VARCHAR(191) NULL,
    `warning` TEXT NULL,
    `institutionLines` TEXT NULL,
    `createdById` VARCHAR(191) NULL,
    `lastEditedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SOP_nomorSOP_key`(`nomorSOP`),
    INDEX `SOP_opdId_status_idx`(`opdId`, `status`),
    INDEX `SOP_peraturanId_idx`(`peraturanId`),
    INDEX `SOP_createdById_idx`(`createdById`),
    INDEX `SOP_lastEditedById_idx`(`lastEditedById`),
    INDEX `SOP_picUserId_idx`(`picUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LawBasis` (
    `id` VARCHAR(191) NOT NULL,
    `sopId` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,

    INDEX `LawBasis_sopId_idx`(`sopId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Equipment` (
    `id` VARCHAR(191) NOT NULL,
    `sopId` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,

    INDEX `Equipment_sopId_idx`(`sopId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecordData` (
    `id` VARCHAR(191) NOT NULL,
    `sopId` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,

    INDEX `RecordData_sopId_idx`(`sopId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RelatedSOP` (
    `sopId` VARCHAR(191) NOT NULL,
    `relatedSopId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`sopId`, `relatedSopId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProsedurRow` (
    `id` VARCHAR(191) NOT NULL,
    `sopId` VARCHAR(191) NOT NULL,
    `no` INTEGER NOT NULL,
    `kegiatan` TEXT NOT NULL,
    `type` ENUM('TERMINATOR', 'TASK', 'DECISION') NOT NULL DEFAULT 'TASK',
    `mutuKelengkapan` TEXT NULL,
    `mutuWaktu` VARCHAR(191) NULL,
    `output` TEXT NULL,
    `keterangan` TEXT NULL,
    `time` INTEGER NULL,
    `timeUnit` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL,
    `nextStepYesId` VARCHAR(191) NULL,
    `nextStepNoId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProsedurRow_sopId_idx`(`sopId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pelaksana` (
    `id` VARCHAR(191) NOT NULL,
    `namaLengkap` VARCHAR(191) NOT NULL,
    `nip` VARCHAR(191) NULL,
    `jabatan` VARCHAR(191) NULL,
    `pangkat` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `nohp` VARCHAR(191) NULL,
    `deskripsi` TEXT NULL,
    `opdId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Pelaksana_opdId_idx`(`opdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProsedurRowPelaksana` (
    `prosedurRowId` VARCHAR(191) NOT NULL,
    `pelaksanaId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`prosedurRowId`, `pelaksanaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TimPenyusun` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `opdId` VARCHAR(191) NOT NULL,
    `status` ENUM('AKTIF', 'NONAKTIF') NOT NULL DEFAULT 'AKTIF',
    `roleInternal` ENUM('KOORDINATOR', 'ANGGOTA') NOT NULL DEFAULT 'ANGGOTA',
    `tanggalBergabung` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TimPenyusun_userId_idx`(`userId`),
    INDEX `TimPenyusun_opdId_idx`(`opdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TimEvaluasiAnggota` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('AKTIF', 'NONAKTIF') NOT NULL DEFAULT 'AKTIF',
    `tanggalBergabung` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TimEvaluasiAnggota_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerifikasiBatch` (
    `id` VARCHAR(191) NOT NULL,
    `opdId` VARCHAR(191) NOT NULL,
    `jenis` ENUM('TERJADWAL', 'MANDIRI') NOT NULL,
    `status` ENUM('AKTIF', 'SELESAI', 'TERVERIFIKASI') NOT NULL DEFAULT 'AKTIF',
    `catatan` TEXT NULL,
    `nomorBA` VARCHAR(191) NULL,
    `tanggalRequest` DATETIME(3) NULL,
    `tanggalEvaluasi` DATETIME(3) NULL,
    `nilaiOPD` INTEGER NULL,
    `verifiedByUserId` VARCHAR(191) NULL,
    `signedByKoordinatorUserId` VARCHAR(191) NULL,
    `isSignedByKoordinator` BOOLEAN NOT NULL DEFAULT false,
    `tanggalTTDBaByKoordinator` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `VerifikasiBatch_opdId_idx`(`opdId`),
    INDEX `VerifikasiBatch_verifiedByUserId_idx`(`verifiedByUserId`),
    INDEX `VerifikasiBatch_signedByKoordinatorUserId_idx`(`signedByKoordinatorUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvaluasiItem` (
    `id` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191) NOT NULL,
    `sopId` VARCHAR(191) NOT NULL,
    `evaluatorId` VARCHAR(191) NOT NULL,
    `hasil` ENUM('SESUAI', 'REVISI_BIRO') NULL,
    `catatan` TEXT NULL,
    `rekomendasi` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EvaluasiItem_batchId_idx`(`batchId`),
    INDEX `EvaluasiItem_sopId_idx`(`sopId`),
    INDEX `EvaluasiItem_evaluatorId_idx`(`evaluatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TTEProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pinHash` VARCHAR(191) NOT NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `role` ENUM('KEPALA_OPD', 'BIRO_ORGANISASI', 'TIM_PENYUSUN') NOT NULL,
    `verificationToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TTEProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TTESignature` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('KEPALA_OPD', 'BIRO_ORGANISASI', 'TIM_PENYUSUN') NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `documentLabel` VARCHAR(191) NOT NULL,
    `referenceId` VARCHAR(191) NOT NULL,
    `documentHash` VARCHAR(191) NOT NULL,
    `sopId` VARCHAR(191) NULL,
    `batchId` VARCHAR(191) NULL,
    `signedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TTESignature_userId_idx`(`userId`),
    INDEX `TTESignature_sopId_idx`(`sopId`),
    INDEX `TTESignature_batchId_idx`(`batchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `sopId` VARCHAR(191) NOT NULL,
    `action` ENUM('BUAT_SOP', 'SIMPAN_DRAFT', 'SELESAI_PENYUSUNAN', 'AJUKAN_EVALUASI', 'MULAI_EVALUASI', 'KIRIM_HASIL_EVALUASI', 'VERIFIKASI_BATCH', 'TTD_BA_KEPALA_OPD', 'SAHKAN_SOP', 'CABUT_SOP', 'REVISI_DARI_EVALUATOR') NOT NULL,
    `aktorId` VARCHAR(191) NOT NULL,
    `aktorRole` ENUM('BIRO_ORGANISASI', 'TIM_EVALUASI', 'TIM_PENYUSUN', 'KEPALA_OPD') NOT NULL,
    `statusSebelum` ENUM('DRAFT', 'SEDANG_DISUSUN', 'SIAP_DIEVALUASI', 'DIAJUKAN_EVALUASI', 'SEDANG_DIEVALUASI', 'REVISI_DARI_TIM_EVALUASI', 'SIAP_DIVERIFIKASI', 'DIVERIFIKASI_BIRO_ORGANISASI', 'BERLAKU', 'DICABUT') NULL,
    `statusSesudah` ENUM('DRAFT', 'SEDANG_DISUSUN', 'SIAP_DIEVALUASI', 'DIAJUKAN_EVALUASI', 'SEDANG_DIEVALUASI', 'REVISI_DARI_TIM_EVALUASI', 'SIAP_DIVERIFIKASI', 'DIVERIFIKASI_BIRO_ORGANISASI', 'BERLAKU', 'DICABUT') NOT NULL,
    `keterangan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_sopId_idx`(`sopId`),
    INDEX `AuditLog_aktorId_idx`(`aktorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImplementQualification` (
    `id` VARCHAR(191) NOT NULL,
    `sopId` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,

    INDEX `ImplementQualification_sopId_idx`(`sopId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Komentar` (
    `id` VARCHAR(191) NOT NULL,
    `sopId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `isi` TEXT NOT NULL,
    `bagian` VARCHAR(191) NULL,
    `status` ENUM('OPEN', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Komentar_sopId_idx`(`sopId`),
    INDEX `Komentar_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `OPD`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Peraturan` ADD CONSTRAINT `Peraturan_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SOP` ADD CONSTRAINT `SOP_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `OPD`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SOP` ADD CONSTRAINT `SOP_peraturanId_fkey` FOREIGN KEY (`peraturanId`) REFERENCES `Peraturan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SOP` ADD CONSTRAINT `SOP_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SOP` ADD CONSTRAINT `SOP_lastEditedById_fkey` FOREIGN KEY (`lastEditedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SOP` ADD CONSTRAINT `SOP_picUserId_fkey` FOREIGN KEY (`picUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LawBasis` ADD CONSTRAINT `LawBasis_sopId_fkey` FOREIGN KEY (`sopId`) REFERENCES `SOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipment` ADD CONSTRAINT `Equipment_sopId_fkey` FOREIGN KEY (`sopId`) REFERENCES `SOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecordData` ADD CONSTRAINT `RecordData_sopId_fkey` FOREIGN KEY (`sopId`) REFERENCES `SOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RelatedSOP` ADD CONSTRAINT `RelatedSOP_sopId_fkey` FOREIGN KEY (`sopId`) REFERENCES `SOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RelatedSOP` ADD CONSTRAINT `RelatedSOP_relatedSopId_fkey` FOREIGN KEY (`relatedSopId`) REFERENCES `SOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProsedurRow` ADD CONSTRAINT `ProsedurRow_sopId_fkey` FOREIGN KEY (`sopId`) REFERENCES `SOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProsedurRow` ADD CONSTRAINT `ProsedurRow_nextStepYesId_fkey` FOREIGN KEY (`nextStepYesId`) REFERENCES `ProsedurRow`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProsedurRow` ADD CONSTRAINT `ProsedurRow_nextStepNoId_fkey` FOREIGN KEY (`nextStepNoId`) REFERENCES `ProsedurRow`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pelaksana` ADD CONSTRAINT `Pelaksana_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `OPD`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProsedurRowPelaksana` ADD CONSTRAINT `ProsedurRowPelaksana_prosedurRowId_fkey` FOREIGN KEY (`prosedurRowId`) REFERENCES `ProsedurRow`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProsedurRowPelaksana` ADD CONSTRAINT `ProsedurRowPelaksana_pelaksanaId_fkey` FOREIGN KEY (`pelaksanaId`) REFERENCES `Pelaksana`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimPenyusun` ADD CONSTRAINT `TimPenyusun_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimPenyusun` ADD CONSTRAINT `TimPenyusun_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `OPD`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimEvaluasiAnggota` ADD CONSTRAINT `TimEvaluasiAnggota_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VerifikasiBatch` ADD CONSTRAINT `VerifikasiBatch_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `OPD`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VerifikasiBatch` ADD CONSTRAINT `VerifikasiBatch_verifiedByUserId_fkey` FOREIGN KEY (`verifiedByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VerifikasiBatch` ADD CONSTRAINT `VerifikasiBatch_signedByKoordinatorUserId_fkey` FOREIGN KEY (`signedByKoordinatorUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluasiItem` ADD CONSTRAINT `EvaluasiItem_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `VerifikasiBatch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluasiItem` ADD CONSTRAINT `EvaluasiItem_sopId_fkey` FOREIGN KEY (`sopId`) REFERENCES `SOP`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluasiItem` ADD CONSTRAINT `EvaluasiItem_evaluatorId_fkey` FOREIGN KEY (`evaluatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TTEProfile` ADD CONSTRAINT `TTEProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TTESignature` ADD CONSTRAINT `TTESignature_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TTESignature` ADD CONSTRAINT `TTESignature_sopId_fkey` FOREIGN KEY (`sopId`) REFERENCES `SOP`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TTESignature` ADD CONSTRAINT `TTESignature_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `VerifikasiBatch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_sopId_fkey` FOREIGN KEY (`sopId`) REFERENCES `SOP`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_aktorId_fkey` FOREIGN KEY (`aktorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImplementQualification` ADD CONSTRAINT `ImplementQualification_sopId_fkey` FOREIGN KEY (`sopId`) REFERENCES `SOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Komentar` ADD CONSTRAINT `Komentar_sopId_fkey` FOREIGN KEY (`sopId`) REFERENCES `SOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Komentar` ADD CONSTRAINT `Komentar_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
