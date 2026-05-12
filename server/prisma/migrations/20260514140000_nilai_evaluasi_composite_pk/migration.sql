-- Normalisasi: PK komposit (pengajuanEvaluasiId, detailSopId), hapus surrogate nilaiEvaluasiId.
ALTER TABLE `NilaiEvaluasi` DROP PRIMARY KEY;
ALTER TABLE `NilaiEvaluasi` DROP INDEX `NilaiEvaluasi_pengajuanEvaluasiId_detailSopId_key`;
ALTER TABLE `NilaiEvaluasi` DROP COLUMN `nilaiEvaluasiId`;
ALTER TABLE `NilaiEvaluasi` ADD PRIMARY KEY (`pengajuanEvaluasiId`, `detailSopId`);
