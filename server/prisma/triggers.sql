-- Phase 1: Triggers
-- Apply after baseline migration with: npx prisma db execute --file prisma/triggers.sql

-- ============================================
-- [P0-B] Satu versi BERLAKU per SOP
-- ============================================
-- Trigger ini mencegah ada dua DetailSOP dengan status BERLAKU untuk SOP yang sama
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS trg_satu_berlaku_per_sop
BEFORE UPDATE ON DetailSOP
FOR EACH ROW
BEGIN
  IF NEW.status = 'BERLAKU' AND OLD.status != 'BERLAKU' THEN
    IF EXISTS (
      SELECT 1 FROM DetailSOP
      WHERE sopId = NEW.sopId
        AND status = 'BERLAKU'
        AND id != NEW.id
    ) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SOP sudah memiliki versi BERLAKU. Tetapkan versi lama ke DIGANTIKAN dulu.';
    END IF;
  END IF;
END$$
DELIMITER ;

-- ============================================
-- [P0-D] Status terminal guard untuk DetailSOP
-- ============================================
-- DIGANTIKAN dan DICABUT adalah status terminal yang tidak bisa diubah
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS trg_detailsop_status_terminal
BEFORE UPDATE ON DetailSOP
FOR EACH ROW
BEGIN
  IF NEW.status != OLD.status AND OLD.status IN ('DIGANTIKAN', 'DICABUT') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Status terminal SOP tidak bisa diubah';
  END IF;
END$$
DELIMITER ;

-- ============================================
-- [P0-D] Status transition guard untuk PengajuanEvaluasi
-- ============================================
-- Mencegah transisi status yang tidak valid
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS trg_pengajuan_status_transition
BEFORE UPDATE ON PengajuanEvaluasi
FOR EACH ROW
BEGIN
  DECLARE valid_transition BOOLEAN DEFAULT FALSE;

  -- Define valid transitions
  IF OLD.status = 'MENUNGGU_EVALUASI' AND NEW.status = 'SEDANG_DIEVALUASI' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'SEDANG_DIEVALUASI' AND NEW.status = 'SELESAI_DIEVALUASI' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'SELESAI_DIEVALUASI' AND NEW.status = 'DIVERIFIKASI_BIRO' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'DIVERIFIKASI_BIRO' AND NEW.status = 'DITANDATANGANI_KOORDINATOR' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'DITANDATANGANI_KOORDINATOR' AND NEW.status = 'SELESAI' THEN
    SET valid_transition = TRUE;
  END IF;

  -- SELESAI is terminal
  IF OLD.status = 'SELESAI' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Status SELESAI adalah terminal dan tidak bisa diubah';
  END IF;

  -- Validate transition
  IF NOT valid_transition AND NEW.status != OLD.status THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Transisi status pengajuan evaluasi tidak valid';
  END IF;
END$$
DELIMITER ;

-- ============================================
-- [P1-2] Status transition guard untuk DetailSOP
-- ============================================
-- Mencegah transisi status SOP yang tidak valid (skip intermediate states)
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS trg_detailsop_status_transition
BEFORE UPDATE ON DetailSOP
FOR EACH ROW
BEGIN
  DECLARE valid_transition BOOLEAN DEFAULT FALSE;

  -- Define valid transitions (see: docs/SCHEMA-CONSTRAINTS.md [P0-D])
  IF OLD.status = 'DRAFT' AND NEW.status = 'SEDANG_DISUSUN' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'SEDANG_DISUSUN' AND NEW.status = 'SIAP_DIEVALUASI' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'SIAP_DIEVALUASI' AND NEW.status = 'DIAJUKAN_EVALUASI' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'DIAJUKAN_EVALUASI' AND NEW.status = 'SEDANG_DIEVALUASI' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'SEDANG_DIEVALUASI' AND NEW.status = 'REVISI_DARI_TIM_EVALUASI' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'SEDANG_DIEVALUASI' AND NEW.status = 'SIAP_DIVERIFIKASI' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'REVISI_DARI_TIM_EVALUASI' AND NEW.status = 'SEDANG_DISUSUN' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'SIAP_DIVERIFIKASI' AND NEW.status = 'DIVERIFIKASI_BIRO_ORGANISASI' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'DIVERIFIKASI_BIRO_ORGANISASI' AND NEW.status = 'BERLAKU' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'BERLAKU' AND NEW.status = 'DIGANTIKAN' THEN
    SET valid_transition = TRUE;
  ELSEIF OLD.status = 'BERLAKU' AND NEW.status = 'DICABUT' THEN
    SET valid_transition = TRUE;
  END IF;

  -- Terminal states cannot be changed (except BERLAKU → DIGANTIKAN/DICABUT)
  IF OLD.status IN ('DIGANTIKAN', 'DICABUT') AND NEW.status != OLD.status THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Status terminal SOP tidak bisa diubah';
  END IF;

  -- Validate transition
  IF NOT valid_transition AND NEW.status != OLD.status THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Transisi status SOP tidak valid: ' || OLD.status || ' → ' || NEW.status;
  END IF;
END$$
DELIMITER ;
