-- CreateTrigger: Enforce SOP BERLAKU requires TTESignature
-- MariaDB BEFORE UPDATE trigger for cross-table validation
-- SOP cannot be set to BERLAKU without at least one TTESignature linked to it

CREATE TRIGGER check_sop_berlaku_has_tte
BEFORE UPDATE ON `SOP`
FOR EACH ROW
BEGIN
  IF NEW.status = 'BERLAKU' AND OLD.status != 'BERLAKU' THEN
    IF NOT EXISTS (
      SELECT 1 FROM `TTESignature` WHERE `sopId` = NEW.id
    ) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SOP cannot be set to BERLAKU without a TTESignature';
    END IF;
  END IF;
END;
