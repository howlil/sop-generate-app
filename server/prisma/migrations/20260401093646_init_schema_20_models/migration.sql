-- CreateTable
CREATE TABLE `Pengguna` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kataSandi` VARCHAR(191) NOT NULL,
    `peran` ENUM('BIRO_ORGANISASI', 'TIM_EVALUASI', 'TIM_PENYUSUN', 'KOORDINATOR_TIM_PENYUSUN', 'KEPALA_OPD') NOT NULL,
    `opdId` VARCHAR(191) NULL,
    `nip` VARCHAR(191) NOT NULL,
    `jabatan` VARCHAR(191) NOT NULL,
    `pangkat` VARCHAR(191) NOT NULL,
    `nohp` VARCHAR(191) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Pengguna_email_key`(`email`),
    UNIQUE INDEX `Pengguna_nip_key`(`nip`),
    INDEX `Pengguna_opdId_idx`(`opdId`),
    INDEX `Pengguna_deletedAt_idx`(`deletedAt`),
    INDEX `Pengguna_opdId_deletedAt_idx`(`opdId`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OPD` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Peraturan` (
    `id` VARCHAR(191) NOT NULL,
    `opdId` VARCHAR(191) NOT NULL,
    `namaPeraturan` VARCHAR(191) NOT NULL,
    `nomor` VARCHAR(191) NOT NULL,
    `tahun` INTEGER NOT NULL,
    `tentang` VARCHAR(191) NOT NULL,
    `status` ENUM('BERLAKU', 'DICABUT') NOT NULL DEFAULT 'BERLAKU',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Peraturan_opdId_idx`(`opdId`),
    UNIQUE INDEX `Peraturan_opdId_nomor_tahun_key`(`opdId`, `nomor`, `tahun`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SOP` (
    `id` VARCHAR(191) NOT NULL,
    `opdId` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SOP_opdId_idx`(`opdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailSOP` (
    `id` VARCHAR(191) NOT NULL,
    `sopId` VARCHAR(191) NOT NULL,
    `salinDariDetailSopId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'SEDANG_DISUSUN', 'SIAP_DIEVALUASI', 'DIAJUKAN_EVALUASI', 'SEDANG_DIEVALUASI', 'REVISI_DARI_TIM_EVALUASI', 'SIAP_DIVERIFIKASI', 'DIVERIFIKASI_BIRO_ORGANISASI', 'BERLAKU', 'DIGANTIKAN', 'DICABUT') NOT NULL DEFAULT 'DRAFT',
    `versi` INTEGER NOT NULL DEFAULT 1,
    `nomorSOP` VARCHAR(191) NOT NULL,
    `tanggalPembuatan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggalRevisi` DATETIME(3) NULL,
    `tanggalEfektif` DATETIME(3) NULL,
    `logoInstansi` VARCHAR(191) NOT NULL,
    `namaLembaga` TEXT NOT NULL,
    `lebarKolomKegiatan` INTEGER NULL,
    `lebarKolomPelaksana` INTEGER NULL,
    `lebarKolomKelengkapan` INTEGER NULL,
    `lebarKolomWaktu` INTEGER NULL,
    `lebarKolomOutput` INTEGER NULL,
    `lebarKolomKeterangan` INTEGER NULL,
    `dibuatOlehId` VARCHAR(191) NULL,
    `terakhirDieditOlehId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DetailSOP_nomorSOP_key`(`nomorSOP`),
    INDEX `DetailSOP_sopId_status_idx`(`sopId`, `status`),
    INDEX `DetailSOP_status_idx`(`status`),
    INDEX `DetailSOP_salinDariDetailSopId_idx`(`salinDariDetailSopId`),
    INDEX `DetailSOP_dibuatOlehId_idx`(`dibuatOlehId`),
    INDEX `DetailSOP_terakhirDieditOlehId_idx`(`terakhirDieditOlehId`),
    UNIQUE INDEX `DetailSOP_sopId_versi_key`(`sopId`, `versi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LampiranTeks` (
    `id` VARCHAR(191) NOT NULL,
    `sopDetailId` VARCHAR(191) NOT NULL,
    `jenis` ENUM('PERINGATAN', 'KUALIFIKASI_PELAKSANAAN', 'PERALATAN', 'PENCATATAN_PENDATAAN') NOT NULL,
    `teks` TEXT NOT NULL,

    INDEX `LampiranTeks_sopDetailId_jenis_idx`(`sopDetailId`, `jenis`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DasarHukum` (
    `sopDetailId` VARCHAR(191) NOT NULL,
    `peraturanId` VARCHAR(191) NOT NULL,

    INDEX `DasarHukum_peraturanId_idx`(`peraturanId`),
    PRIMARY KEY (`sopDetailId`, `peraturanId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SopTerkait` (
    `sopDetailId` VARCHAR(191) NOT NULL,
    `sopTerkaitDetailId` VARCHAR(191) NOT NULL,

    INDEX `SopTerkait_sopTerkaitDetailId_idx`(`sopTerkaitDetailId`),
    PRIMARY KEY (`sopDetailId`, `sopTerkaitDetailId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LangkahSOP` (
    `id` VARCHAR(191) NOT NULL,
    `sopDetailId` VARCHAR(191) NOT NULL,
    `kegiatan` TEXT NOT NULL,
    `jenis` ENUM('TERMINATOR', 'TASK', 'DECISION') NOT NULL DEFAULT 'TASK',
    `urutan` INTEGER NOT NULL,
    `kelengkapan` VARCHAR(191) NOT NULL,
    `keluaran` VARCHAR(191) NOT NULL,
    `waktu` INTEGER NOT NULL,
    `satuanWaktu` ENUM('m', 'h', 'd', 'w', 'mo', 'y') NOT NULL,
    `keterangan` TEXT NOT NULL,
    `pelaksanaId` VARCHAR(191) NOT NULL,
    `langkahSelanjutnyaYaId` VARCHAR(191) NULL,
    `langkahSelanjutnyaTidakId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LangkahSOP_sopDetailId_urutan_idx`(`sopDetailId`, `urutan`),
    INDEX `LangkahSOP_pelaksanaId_idx`(`pelaksanaId`),
    UNIQUE INDEX `LangkahSOP_sopDetailId_urutan_key`(`sopDetailId`, `urutan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiagramLayout` (
    `id` VARCHAR(191) NOT NULL,
    `sopDetailId` VARCHAR(191) NOT NULL,
    `jenis` ENUM('FLOWCHART', 'BPMN') NOT NULL,
    `versiLayout` INTEGER NOT NULL DEFAULT 1,
    `layoutSeed` INTEGER NOT NULL DEFAULT 0,
    `gayaPanah` ENUM('STRAIGHT', 'ORTHOGONAL') NULL,
    `langkahPerHalaman` INTEGER NULL DEFAULT 10,
    `lebarAreaKegiatan` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DiagramLayout_sopDetailId_idx`(`sopDetailId`),
    UNIQUE INDEX `DiagramLayout_sopDetailId_jenis_versiLayout_key`(`sopDetailId`, `jenis`, `versiLayout`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiagramNodePosition` (
    `diagramLayoutId` VARCHAR(191) NOT NULL,
    `langkahSopId` VARCHAR(191) NOT NULL,
    `page` INTEGER NOT NULL DEFAULT 1,
    `x` INTEGER NOT NULL,
    `y` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DiagramNodePosition_langkahSopId_idx`(`langkahSopId`),
    PRIMARY KEY (`diagramLayoutId`, `langkahSopId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiagramEdge` (
    `id` VARCHAR(191) NOT NULL,
    `diagramLayoutId` VARCHAR(191) NOT NULL,
    `dariLangkahId` VARCHAR(191) NOT NULL,
    `keLangkahId` VARCHAR(191) NOT NULL,
    `cabang` ENUM('DEFAULT', 'YA', 'TIDAK') NOT NULL DEFAULT 'DEFAULT',
    `labelTeks` VARCHAR(191) NULL,
    `labelX` INTEGER NULL,
    `labelY` INTEGER NULL,

    INDEX `DiagramEdge_diagramLayoutId_idx`(`diagramLayoutId`),
    INDEX `DiagramEdge_dariLangkahId_idx`(`dariLangkahId`),
    INDEX `DiagramEdge_keLangkahId_idx`(`keLangkahId`),
    UNIQUE INDEX `DiagramEdge_diagramLayoutId_dariLangkahId_keLangkahId_cabang_key`(`diagramLayoutId`, `dariLangkahId`, `keLangkahId`, `cabang`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiagramEdgePoint` (
    `diagramEdgeId` VARCHAR(191) NOT NULL,
    `urutan` INTEGER NOT NULL,
    `x` INTEGER NOT NULL,
    `y` INTEGER NOT NULL,

    PRIMARY KEY (`diagramEdgeId`, `urutan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pelaksana` (
    `id` VARCHAR(191) NOT NULL,
    `opdId` VARCHAR(191) NOT NULL,
    `namaPelaksana` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Pelaksana_opdId_idx`(`opdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailSOPPelaksana` (
    `sopDetailId` VARCHAR(191) NOT NULL,
    `pelaksanaId` VARCHAR(191) NOT NULL,
    `urutan` INTEGER NOT NULL DEFAULT 0,

    INDEX `DetailSOPPelaksana_pelaksanaId_idx`(`pelaksanaId`),
    PRIMARY KEY (`sopDetailId`, `pelaksanaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TimPenyusun` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `opdId` VARCHAR(191) NOT NULL,
    `status` ENUM('AKTIF', 'NONAKTIF') NOT NULL DEFAULT 'AKTIF',
    `tanggalBergabung` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `berakhirPada` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TimPenyusun_userId_idx`(`userId`),
    INDEX `TimPenyusun_opdId_idx`(`opdId`),
    INDEX `TimPenyusun_opdId_status_idx`(`opdId`, `status`),
    UNIQUE INDEX `TimPenyusun_userId_opdId_key`(`userId`, `opdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TimEvaluasiAnggota` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('AKTIF', 'NONAKTIF') NOT NULL DEFAULT 'AKTIF',
    `tanggalBergabung` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `berakhirPada` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TimEvaluasiAnggota_userId_key`(`userId`),
    INDEX `TimEvaluasiAnggota_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PengajuanEvaluasi` (
    `id` VARCHAR(191) NOT NULL,
    `opdId` VARCHAR(191) NOT NULL,
    `jenis` ENUM('TERJADWAL', 'MANDIRI') NOT NULL,
    `status` ENUM('MENUNGGU_EVALUASI', 'SEDANG_DIEVALUASI', 'SELESAI_DIEVALUASI', 'DIVERIFIKASI_BIRO', 'DITANDATANGANI_KOORDINATOR', 'SELESAI') NOT NULL DEFAULT 'MENUNGGU_EVALUASI',
    `catatan` TEXT NULL,
    `nomorBA` VARCHAR(191) NULL,
    `tanggalPermintaan` DATETIME(3) NULL,
    `tanggalEvaluasi` DATETIME(3) NULL,
    `nilaiOPD` INTEGER NULL,
    `diverifikasiOlehUserId` VARCHAR(191) NULL,
    `ditandatanganiOlehKoordinatorUserId` VARCHAR(191) NULL,
    `tanggalTTDBaKoordinator` DATETIME(3) NULL,
    `diselesaikanOlehId` VARCHAR(191) NULL,
    `tanggalDiselesaikan` DATETIME(3) NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PengajuanEvaluasi_opdId_idx`(`opdId`),
    INDEX `PengajuanEvaluasi_status_idx`(`status`),
    INDEX `PengajuanEvaluasi_jenis_idx`(`jenis`),
    INDEX `PengajuanEvaluasi_diverifikasiOlehUserId_idx`(`diverifikasiOlehUserId`),
    INDEX `PengajuanEvaluasi_ditandatanganiOlehKoordinatorUserId_idx`(`ditandatanganiOlehKoordinatorUserId`),
    INDEX `PengajuanEvaluasi_diselesaikanOlehId_idx`(`diselesaikanOlehId`),
    INDEX `PengajuanEvaluasi_opdId_status_idx`(`opdId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NilaiEvaluasi` (
    `id` VARCHAR(191) NOT NULL,
    `pengajuanEvaluasiId` VARCHAR(191) NOT NULL,
    `sopDetailId` VARCHAR(191) NOT NULL,
    `hasil` ENUM('SESUAI', 'TIDAK_SESUAI') NULL,
    `catatan` TEXT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `dinilaiOlehId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NilaiEvaluasi_pengajuanEvaluasiId_idx`(`pengajuanEvaluasiId`),
    INDEX `NilaiEvaluasi_sopDetailId_idx`(`sopDetailId`),
    INDEX `NilaiEvaluasi_dinilaiOlehId_idx`(`dinilaiOlehId`),
    INDEX `NilaiEvaluasi_pengajuanEvaluasiId_hasil_idx`(`pengajuanEvaluasiId`, `hasil`),
    UNIQUE INDEX `NilaiEvaluasi_pengajuanEvaluasiId_sopDetailId_key`(`pengajuanEvaluasiId`, `sopDetailId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogNilaiEvaluasi` (
    `id` VARCHAR(191) NOT NULL,
    `pengajuanEvaluasiId` VARCHAR(191) NOT NULL,
    `sopDetailId` VARCHAR(191) NOT NULL,
    `evaluatorId` VARCHAR(191) NOT NULL,
    `hasilSebelum` ENUM('SESUAI', 'TIDAK_SESUAI') NULL,
    `hasilSesudah` ENUM('SESUAI', 'TIDAK_SESUAI') NULL,
    `catatanSebelum` TEXT NULL,
    `catatanSesudah` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LogNilaiEvaluasi_pengajuanEvaluasiId_sopDetailId_idx`(`pengajuanEvaluasiId`, `sopDetailId`),
    INDEX `LogNilaiEvaluasi_evaluatorId_idx`(`evaluatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProfilTTE` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `hashPin` VARCHAR(191) NOT NULL,
    `emailTerverifikasi` BOOLEAN NOT NULL DEFAULT false,
    `peran` ENUM('KEPALA_OPD', 'BIRO_ORGANISASI', 'KOORDINATOR_TIM_PENYUSUN') NOT NULL,
    `tokenVerifikasi` VARCHAR(191) NULL,
    `tokenExpiry` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProfilTTE_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TandaTanganTTE` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `peran` ENUM('KEPALA_OPD', 'BIRO_ORGANISASI', 'KOORDINATOR_TIM_PENYUSUN') NOT NULL,
    `nomorDokumen` VARCHAR(191) NOT NULL,
    `jenisDokumen` VARCHAR(191) NOT NULL,
    `judulDokumen` VARCHAR(191) NOT NULL,
    `hashDokumen` VARCHAR(191) NOT NULL,
    `sopDetailId` VARCHAR(191) NULL,
    `pengajuanEvaluasiId` VARCHAR(191) NULL,
    `ditandatanganiPada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TandaTanganTTE_userId_idx`(`userId`),
    INDEX `TandaTanganTTE_sopDetailId_idx`(`sopDetailId`),
    INDEX `TandaTanganTTE_pengajuanEvaluasiId_idx`(`pengajuanEvaluasiId`),
    INDEX `TandaTanganTTE_hashDokumen_idx`(`hashDokumen`),
    UNIQUE INDEX `TandaTanganTTE_sopDetailId_peran_key`(`sopDetailId`, `peran`),
    UNIQUE INDEX `TandaTanganTTE_pengajuanEvaluasiId_peran_key`(`pengajuanEvaluasiId`, `peran`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogEditSOP` (
    `id` VARCHAR(191) NOT NULL,
    `sopDetailId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bagian` ENUM('METADATA', 'LANGKAH_SOP', 'LAMPIRAN_TEKS', 'DASAR_HUKUM', 'PELAKSANA', 'DIAGRAM', 'SOP_TERKAIT') NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `keterangan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LogEditSOP_sopDetailId_createdAt_idx`(`sopDetailId`, `createdAt`),
    INDEX `LogEditSOP_sopDetailId_bagian_idx`(`sopDetailId`, `bagian`),
    INDEX `LogEditSOP_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Komentar` (
    `id` VARCHAR(191) NOT NULL,
    `sopDetailId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `isi` TEXT NOT NULL,
    `status` ENUM('OPEN', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Komentar_sopDetailId_status_createdAt_idx`(`sopDetailId`, `status`, `createdAt`),
    INDEX `Komentar_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pengguna` ADD CONSTRAINT `Pengguna_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `OPD`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Peraturan` ADD CONSTRAINT `Peraturan_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `OPD`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SOP` ADD CONSTRAINT `SOP_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `OPD`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailSOP` ADD CONSTRAINT `DetailSOP_salinDariDetailSopId_fkey` FOREIGN KEY (`salinDariDetailSopId`) REFERENCES `DetailSOP`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailSOP` ADD CONSTRAINT `DetailSOP_sopId_fkey` FOREIGN KEY (`sopId`) REFERENCES `SOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailSOP` ADD CONSTRAINT `DetailSOP_dibuatOlehId_fkey` FOREIGN KEY (`dibuatOlehId`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailSOP` ADD CONSTRAINT `DetailSOP_terakhirDieditOlehId_fkey` FOREIGN KEY (`terakhirDieditOlehId`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LampiranTeks` ADD CONSTRAINT `LampiranTeks_sopDetailId_fkey` FOREIGN KEY (`sopDetailId`) REFERENCES `DetailSOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DasarHukum` ADD CONSTRAINT `DasarHukum_sopDetailId_fkey` FOREIGN KEY (`sopDetailId`) REFERENCES `DetailSOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DasarHukum` ADD CONSTRAINT `DasarHukum_peraturanId_fkey` FOREIGN KEY (`peraturanId`) REFERENCES `Peraturan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SopTerkait` ADD CONSTRAINT `SopTerkait_sopDetailId_fkey` FOREIGN KEY (`sopDetailId`) REFERENCES `DetailSOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SopTerkait` ADD CONSTRAINT `SopTerkait_sopTerkaitDetailId_fkey` FOREIGN KEY (`sopTerkaitDetailId`) REFERENCES `DetailSOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LangkahSOP` ADD CONSTRAINT `LangkahSOP_sopDetailId_fkey` FOREIGN KEY (`sopDetailId`) REFERENCES `DetailSOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LangkahSOP` ADD CONSTRAINT `LangkahSOP_langkahSelanjutnyaYaId_fkey` FOREIGN KEY (`langkahSelanjutnyaYaId`) REFERENCES `LangkahSOP`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LangkahSOP` ADD CONSTRAINT `LangkahSOP_langkahSelanjutnyaTidakId_fkey` FOREIGN KEY (`langkahSelanjutnyaTidakId`) REFERENCES `LangkahSOP`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LangkahSOP` ADD CONSTRAINT `LangkahSOP_pelaksanaId_fkey` FOREIGN KEY (`pelaksanaId`) REFERENCES `Pelaksana`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiagramLayout` ADD CONSTRAINT `DiagramLayout_sopDetailId_fkey` FOREIGN KEY (`sopDetailId`) REFERENCES `DetailSOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiagramNodePosition` ADD CONSTRAINT `DiagramNodePosition_diagramLayoutId_fkey` FOREIGN KEY (`diagramLayoutId`) REFERENCES `DiagramLayout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiagramNodePosition` ADD CONSTRAINT `DiagramNodePosition_langkahSopId_fkey` FOREIGN KEY (`langkahSopId`) REFERENCES `LangkahSOP`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiagramEdge` ADD CONSTRAINT `DiagramEdge_diagramLayoutId_fkey` FOREIGN KEY (`diagramLayoutId`) REFERENCES `DiagramLayout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiagramEdge` ADD CONSTRAINT `DiagramEdge_dariLangkahId_fkey` FOREIGN KEY (`dariLangkahId`) REFERENCES `LangkahSOP`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiagramEdge` ADD CONSTRAINT `DiagramEdge_keLangkahId_fkey` FOREIGN KEY (`keLangkahId`) REFERENCES `LangkahSOP`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiagramEdgePoint` ADD CONSTRAINT `DiagramEdgePoint_diagramEdgeId_fkey` FOREIGN KEY (`diagramEdgeId`) REFERENCES `DiagramEdge`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pelaksana` ADD CONSTRAINT `Pelaksana_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `OPD`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailSOPPelaksana` ADD CONSTRAINT `DetailSOPPelaksana_sopDetailId_fkey` FOREIGN KEY (`sopDetailId`) REFERENCES `DetailSOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailSOPPelaksana` ADD CONSTRAINT `DetailSOPPelaksana_pelaksanaId_fkey` FOREIGN KEY (`pelaksanaId`) REFERENCES `Pelaksana`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimPenyusun` ADD CONSTRAINT `TimPenyusun_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimPenyusun` ADD CONSTRAINT `TimPenyusun_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `OPD`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimEvaluasiAnggota` ADD CONSTRAINT `TimEvaluasiAnggota_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengajuanEvaluasi` ADD CONSTRAINT `PengajuanEvaluasi_opdId_fkey` FOREIGN KEY (`opdId`) REFERENCES `OPD`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengajuanEvaluasi` ADD CONSTRAINT `PengajuanEvaluasi__diverifikasiOlehUser_fkey` FOREIGN KEY (`diverifikasiOlehUserId`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengajuanEvaluasi` ADD CONSTRAINT `PengajuanEvaluasi__ditandatanganiOlehKoordinatorUser_fkey` FOREIGN KEY (`ditandatanganiOlehKoordinatorUserId`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengajuanEvaluasi` ADD CONSTRAINT `PengajuanEvaluasi__diselesaikanOleh_fkey` FOREIGN KEY (`diselesaikanOlehId`) REFERENCES `Pengguna`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NilaiEvaluasi` ADD CONSTRAINT `NilaiEvaluasi_pengajuanEvaluasiId_fkey` FOREIGN KEY (`pengajuanEvaluasiId`) REFERENCES `PengajuanEvaluasi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NilaiEvaluasi` ADD CONSTRAINT `NilaiEvaluasi_sopDetailId_fkey` FOREIGN KEY (`sopDetailId`) REFERENCES `DetailSOP`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NilaiEvaluasi` ADD CONSTRAINT `NilaiEvaluasi_dinilaiOlehId_fkey` FOREIGN KEY (`dinilaiOlehId`) REFERENCES `Pengguna`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogNilaiEvaluasi` ADD CONSTRAINT `LogNilaiEvaluasi_pengajuanEvaluasiId_fkey` FOREIGN KEY (`pengajuanEvaluasiId`) REFERENCES `PengajuanEvaluasi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogNilaiEvaluasi` ADD CONSTRAINT `LogNilaiEvaluasi_evaluatorId_fkey` FOREIGN KEY (`evaluatorId`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProfilTTE` ADD CONSTRAINT `ProfilTTE_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TandaTanganTTE` ADD CONSTRAINT `TandaTanganTTE_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TandaTanganTTE` ADD CONSTRAINT `TandaTanganTTE_sopDetailId_fkey` FOREIGN KEY (`sopDetailId`) REFERENCES `DetailSOP`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TandaTanganTTE` ADD CONSTRAINT `TandaTanganTTE_pengajuanEvaluasiId_fkey` FOREIGN KEY (`pengajuanEvaluasiId`) REFERENCES `PengajuanEvaluasi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogEditSOP` ADD CONSTRAINT `LogEditSOP_sopDetailId_fkey` FOREIGN KEY (`sopDetailId`) REFERENCES `DetailSOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogEditSOP` ADD CONSTRAINT `LogEditSOP_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Komentar` ADD CONSTRAINT `Komentar_sopDetailId_fkey` FOREIGN KEY (`sopDetailId`) REFERENCES `DetailSOP`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Komentar` ADD CONSTRAINT `Komentar_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
