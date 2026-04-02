-- Phase 1: CHECK Constraints and Sentinel Tables
-- Apply after baseline migration with: npx prisma db execute --file prisma/constraints.sql
--
-- IMPORTANT: MySQL does not allow CHECK constraints on columns used in foreign keys.
-- All constraints below that reference FK columns must be enforced at service layer.
--
-- Constraints enforced at service layer:
-- [P1-A] XOR constraint for TandaTanganTTE (sopDetailId XOR pengajuanEvaluasiId)
-- [P2-A] TERMINATOR/TASK/DECISION branching rules (langkahSelanjutnyaYaId/TidakId are FKs)
--
-- See: docs/SCHEMA-CONSTRAINTS.md for implementation details

-- ============================================
-- [P0-C] Tabel Sentinel untuk Double Submit Prevention
-- ============================================
-- Mencegah race condition saat membuat PengajuanEvaluasi
-- Dengan INSERT yang akan gagal jika sudah ada entri aktif

CREATE TABLE IF NOT EXISTS KunciPengajuanEvaluasi (
  opdId VARCHAR(36) NOT NULL,
  jenis ENUM('TERJADWAL', 'MANDIRI') NOT NULL,
  pengajuanEvaluasiId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (opdId, jenis),
  CONSTRAINT fk_kunci_pengajuan
    FOREIGN KEY (pengajuanEvaluasiId) 
    REFERENCES PengajuanEvaluasi(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Index untuk performa
CREATE INDEX idx_kunci_pengajuan_opd ON KunciPengajuanEvaluasi(opdId, jenis);

-- ============================================
-- [P1-A] TTE XOR Constraint
-- ============================================
-- RiwayatTandaTangan harus memiliki tepat satu dari sopDetailId atau pengajuanEvaluasiId
-- Note: This CHECK constraint may fail on MySQL < 8.0.16. For older versions, enforce at service layer only.

ALTER TABLE TandaTanganTTE 
  ADD CONSTRAINT chk_tte_xor
  CHECK (
    (sopDetailId IS NOT NULL AND pengajuanEvaluasiId IS NULL)
    OR
    (sopDetailId IS NULL AND pengajuanEvaluasiId IS NOT NULL)
  );

-- No database-level CHECK constraints applied due to MySQL FK limitations
-- All business constraints are enforced in the service layer
