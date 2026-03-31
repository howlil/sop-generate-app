-- AlterTable: add generated columns untuk unique constraint per OPD + role
ALTER TABLE `Pengguna`
  ADD COLUMN `kepalaOpdKey` VARCHAR(191)
    GENERATED ALWAYS AS (
      CASE 
        WHEN `peran` = 'KEPALA_OPD' AND `opdId` IS NOT NULL 
        THEN CONCAT(`opdId`, '_KEPALA') 
        ELSE NULL 
      END
    ) STORED,
  ADD COLUMN `koordinatorKey` VARCHAR(191)
    GENERATED ALWAYS AS (
      CASE 
        WHEN `peran` = 'KOORDINATOR_TIM_PENYUSUN' AND `opdId` IS NOT NULL 
        THEN CONCAT(`opdId`, '_KOORDINATOR') 
        ELSE NULL 
      END
    ) STORED;

-- CreateIndex: unique constraint per OPD untuk KEPALA_OPD
-- Hanya 1 pengguna per OPD yang bisa punya peran KEPALA_OPD
CREATE UNIQUE INDEX `Pengguna_opdId_kepalaOpdKey_key` ON `Pengguna`(`opdId`, `kepalaOpdKey`);

-- CreateIndex: unique constraint per OPD untuk KOORDINATOR_TIM_PENYUSUN
-- Hanya 1 pengguna per OPD yang bisa punya peran KOORDINATOR_TIM_PENYUSUN
CREATE UNIQUE INDEX `Pengguna_opdId_koordinatorKey_key` ON `Pengguna`(`opdId`, `koordinatorKey`);
