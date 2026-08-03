import { Injectable, Logger } from '@nestjs/common';
import { WhatsappRecipientResolverService } from './whatsapp-recipient-resolver.service';
import { WhatsappReminderRepository } from './whatsapp-reminder.repository';
import { reminderIdentity } from './whatsapp-reminder.types';

@Injectable()
export class WhatsappReminderReconcilerService {
  private readonly logger = new Logger(WhatsappReminderReconcilerService.name);

  constructor(
    private readonly repository: WhatsappReminderRepository,
    private readonly recipientResolver: WhatsappRecipientResolverService,
  ) {}

  async reconcile(now = new Date()): Promise<{ desired: number; deleted: number }> {
    const [pengajuanRows, recipients, existing] = await Promise.all([
      this.repository.findActionablePengajuan(),
      this.repository.findActiveRecipients(),
      this.repository.findExistingReminders(),
    ]);
    const desired = pengajuanRows.flatMap((pengajuan) =>
      this.recipientResolver.resolve(pengajuan, recipients),
    );
    const desiredKeys = new Set(desired.map(reminderIdentity));
    const staleIds = existing
      .filter((reminder) => !desiredKeys.has(reminderIdentity(reminder)))
      .map((reminder) => reminder.pengingatWhatsAppId);

    await Promise.all(
      desired.map((reminder) => this.repository.upsertDesiredReminder(reminder, now)),
    );
    const deleted = await this.repository.deleteReminderIds(staleIds);
    if (desired.length > 0 || deleted > 0) {
      this.logger.debug(`Reconcile reminder selesai desired=${desired.length} deleted=${deleted}`);
    }
    return { desired: desired.length, deleted };
  }
}
