-- Migration: Add lock mechanism untuk SOP yang sedang dievaluasi
-- Trigger ini mencegah perubahan status DetailSOP kalau sudah ada evaluasi yang belum selesai

DELIMITER $$

CREATE TRIGGER trg_lock_sop_saing_dievaluasi 
BEFORE UPDATE ON DetailSOP
FOR EACH ROW
BEGIN
  DECLARE ada_evaluasi_belum_selesai INT;
  
  -- Cek apakah ada evaluasi yang belum selesai untuk SOP ini
  SELECT COUNT(*) INTO ada_evaluasi_belum_selesai 
  FROM DetailEvaluasiSOP 
  WHERE sopDetailId = NEW.id AND hasil IS NULL;
  
  -- Jika ada evaluasi yang belum selesai, BLOCK update status
  IF ada_evaluasi_belum_selesai > 0 AND OLD.status != NEW.status THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'SOP sedang dievaluasi, tidak bisa diubah statusnya sampai semua evaluator selesai';
  END IF;
END$$

DELIMITER ;

-- Drop trigger (kalau mau rollback)
-- DROP TRIGGER IF EXISTS trg_lock_sop_saing_dievaluasi;
