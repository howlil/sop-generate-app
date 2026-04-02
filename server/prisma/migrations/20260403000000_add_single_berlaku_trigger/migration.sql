-- Migration: Add trigger to enforce single BERLAKU version per SOP
-- Date: 2026-04-03
-- Source: Code review finding #1 (Priority 1 - Critical)
-- Issue: Service layer check alone cannot prevent race conditions

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS `check_single_berlaku_per_sop`;

DELIMITER $$

CREATE TRIGGER `check_single_berlaku_per_sop`
BEFORE UPDATE ON `DetailSOP`
FOR EACH ROW
BEGIN
  DECLARE berlaku_count INT;
  
  -- Only check when NEW status is BERLAKU
  IF NEW.status = 'BERLAKU' THEN
    -- Count existing BERLAKU versions (excluding current row)
    SELECT COUNT(*) INTO berlaku_count
    FROM `DetailSOP`
    WHERE `sopId` = NEW.sopId
      AND `status` = 'BERLAKU'
      AND `id` != NEW.id
      AND `deletedAt` IS NULL;
    
    -- If another BERLAKU exists, abort the update
    IF berlaku_count > 0 THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'SOP sudah memiliki versi BERLAKU. Hanya boleh ada 1 versi BERLAKU per SOP.';
    END IF;
  END IF;
END$$

DELIMITER ;

-- Also add trigger for INSERT
DROP TRIGGER IF EXISTS `check_single_berlaku_on_insert`;

DELIMITER $$

CREATE TRIGGER `check_single_berlaku_on_insert`
BEFORE INSERT ON `DetailSOP`
FOR EACH ROW
BEGIN
  DECLARE berlaku_count INT;
  
  -- Only check when NEW status is BERLAKU
  IF NEW.status = 'BERLAKU' THEN
    -- Count existing BERLAKU versions
    SELECT COUNT(*) INTO berlaku_count
    FROM `DetailSOP`
    WHERE `sopId` = NEW.sopId
      AND `status` = 'BERLAKU'
      AND `deletedAt` IS NULL;
    
    -- If another BERLAKU exists, abort the insert
    IF berlaku_count > 0 THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'SOP sudah memiliki versi BERLAKU. Hanya boleh ada 1 versi BERLAKU per SOP.';
    END IF;
  END IF;
END$$

DELIMITER ;

-- Note: This trigger provides database-level enforcement
-- Application layer should still use SELECT FOR UPDATE in transactions
-- for optimal concurrency control
