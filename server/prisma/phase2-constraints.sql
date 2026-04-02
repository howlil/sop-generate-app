-- ============================================
-- Phase 2: Additional Constraints & Triggers
-- ============================================
-- Apply after Phase 1 (constraints.sql + triggers.sql) with:
-- npx prisma db execute --file prisma/phase2-constraints.sql
--
-- This file contains:
-- - [P2-D] Unique constraint enforcement helpers (via service layer)
-- - [P1-F] Status vs berakhirPada consistency triggers
-- - [P2-G] Soft delete filter documentation
-- - [P2-H] Tenant isolation documentation

-- ============================================
-- [P1-F] Status vs berakhirPada Consistency Trigger
-- ============================================
-- Ensures (status = AKTIF) ↔ (berakhirPada IS NULL) for Tim members
-- Applies to: AnggotaTimPenyusun and AnggotaTimEvaluasi

DELIMITER $$
CREATE TRIGGER IF NOT EXISTS trg_tim_status_konsistensi_insert
BEFORE INSERT ON AnggotaTimPenyusun
FOR EACH ROW
BEGIN
  -- If status is AKTIF, berakhirPada must be NULL
  IF NEW.status = 'AKTIF' AND NEW.berakhirPada IS NOT NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Anggota AKTIF harus memiliki berakhirPada NULL';
  END IF;
  
  -- If status is NONAKTIF, berakhirPada must be set
  IF NEW.status = 'NONAKTIF' AND NEW.berakhirPada IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Anggota NONAKTIF harus memiliki berakhirPada';
  END IF;
END$$

CREATE TRIGGER IF NOT EXISTS trg_tim_status_konsistensi_update
BEFORE UPDATE ON AnggotaTimPenyusun
FOR EACH ROW
BEGIN
  -- If status is AKTIF, berakhirPada must be NULL
  IF NEW.status = 'AKTIF' AND NEW.berakhirPada IS NOT NULL THEN
    SET NEW.berakhirPada = NULL;
  END IF;
  
  -- If status is NONAKTIF, set berakhirPada to now if NULL
  IF NEW.status = 'NONAKTIF' AND NEW.berakhirPada IS NULL THEN
    SET NEW.berakhirPada = NOW();
  END IF;
END$$
DELIMITER ;

-- Same for AnggotaTimEvaluasi
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS trg_evaluasi_status_konsistensi_insert
BEFORE INSERT ON AnggotaTimEvaluasi
FOR EACH ROW
BEGIN
  IF NEW.status = 'AKTIF' AND NEW.berakhirPada IS NOT NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Anggota AKTIF harus memiliki berakhirPada NULL';
  END IF;
  
  IF NEW.status = 'NONAKTIF' AND NEW.berakhirPada IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Anggota NONAKTIF harus memiliki berakhirPada';
  END IF;
END$$

CREATE TRIGGER IF NOT EXISTS trg_evaluasi_status_konsistensi_update
BEFORE UPDATE ON AnggotaTimEvaluasi
FOR EACH ROW
BEGIN
  IF NEW.status = 'AKTIF' AND NEW.berakhirPada IS NOT NULL THEN
    SET NEW.berakhirPada = NULL;
  END IF;
  
  IF NEW.status = 'NONAKTIF' AND NEW.berakhirPada IS NULL THEN
    SET NEW.berakhirPada = NOW();
  END IF;
END$$
DELIMITER ;

-- ============================================
-- [P2-G] Soft Delete Filter - Documentation
-- ============================================
-- Prisma middleware untuk auto-filter deletedAt harus diimplementasikan
-- di aplikasi (tidak bisa via SQL trigger).
--
-- Lihat implementasi di: src/common/prisma/prisma.service.ts
-- Middleware ini otomatis menambahkan WHERE deletedAt IS NULL
-- untuk semua query findMany, findFirst, count, aggregate.

-- ============================================
-- [P2-H] Tenant Isolation - Documentation
-- ============================================
-- RLS (Row Level Security) tidak tersedia di MySQL.
-- Filter OPD-based harus diimplementasikan di service layer.
--
-- Pattern yang benar:
-- 1. Selalu ambil opdId dari JWT token (bukan dari request body)
-- 2. Gunakan helper function di repository untuk menambahkan filter
-- 3. Untuk tabel tanpa opdId langsung, lakukan JOIN ke tabel parent
--
-- Contoh tabel yang perlu JOIN:
-- - NilaiEvaluasi → via PengajuanEvaluasi.opdId
-- - LogNilaiEvaluasi → via PengajuanEvaluasi.opdId
-- - LangkahSOP → via DetailSOP → SOP → OPD
-- - RiwayatTandaTangan → via sopDetail.sop.opdId atau pengajuanEvaluasi.opdId

-- ============================================
-- [P3-A] Circular Reference Detection - Note
-- ============================================
-- Deteksi siklus untuk LangkahSOP self-reference harus dilakukan
-- di aplikasi menggunakan DFS (Depth-First Search).
-- Tidak bisa diimplementasikan via SQL trigger.
--
-- Lihat contoh implementasi di docs/SCHEMA-CONSTRAINTS.md [P3-A]
