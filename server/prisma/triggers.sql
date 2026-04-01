-- Phase 1: Triggers
-- Apply after baseline migration with: npx prisma db execute --file prisma/triggers.sql

-- [P0-B] Satu versi BERLAKU per SOP
-- Trigger ini mencegah ada dua DetailSOP dengan status BERLAKU untuk SOP yang sama
DELIMITER $$
CREATE TRIGGER trg_satu_berlaku_per_sop
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

-- [P0-D] Status terminal guard
-- DIGANTIKAN dan DICABUT adalah status terminal yang tidak bisa diubah
DELIMITER $$
CREATE TRIGGER trg_detailsop_status_terminal
BEFORE UPDATE ON DetailSOP
FOR EACH ROW
BEGIN
  IF NEW.status != OLD.status AND OLD.status IN ('DIGANTIKAN', 'DICABUT') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Status terminal SOP tidak bisa diubah';
  END IF;
END$$
DELIMITER ;
