/* eslint-disable @typescript-eslint/unbound-method */
import { JenisPengingatWhatsApp } from '../../../generated/prisma';
import { WhatsappRecipientResolverService } from './whatsapp-recipient-resolver.service';
import { WhatsappReminderReconcilerService } from './whatsapp-reminder-reconciler.service';
import { WhatsappReminderRepository } from './whatsapp-reminder.repository';

describe('WhatsappReminderReconcilerService', () => {
  it('upsert reminder yang diinginkan dan menghapus state stale', async () => {
    const desired = {
      pengajuanEvaluasiId: 'p-1',
      penggunaId: 'u-1',
      jenis: JenisPengingatWhatsApp.EVALUASI_SOP,
      nomorTujuan: '628111111111',
    };
    const repository = {
      findActionablePengajuan: jest.fn().mockResolvedValue([{ pengajuanEvaluasiId: 'p-1' }]),
      findActiveRecipients: jest.fn().mockResolvedValue([{ penggunaId: 'u-1' }]),
      findExistingReminders: jest.fn().mockResolvedValue([
        { pengingatWhatsAppId: 'keep', ...desired },
        {
          pengingatWhatsAppId: 'stale',
          pengajuanEvaluasiId: 'p-old',
          penggunaId: 'u-1',
          jenis: JenisPengingatWhatsApp.EVALUASI_SOP,
        },
      ]),
      upsertDesiredReminder: jest.fn().mockResolvedValue(undefined),
      deleteReminderIds: jest.fn().mockResolvedValue(1),
    } as unknown as WhatsappReminderRepository;
    const resolver = {
      resolve: jest.fn().mockReturnValue([desired]),
    } as unknown as WhatsappRecipientResolverService;
    const service = new WhatsappReminderReconcilerService(repository, resolver);
    const now = new Date('2026-08-02T00:00:00.000Z');

    await expect(service.reconcile(now)).resolves.toEqual({ desired: 1, deleted: 1 });
    expect(repository.upsertDesiredReminder).toHaveBeenCalledWith(desired, now);
    expect(repository.deleteReminderIds).toHaveBeenCalledWith(['stale']);
  });

  it('tetap membersihkan semua reminder ketika tidak ada status actionable', async () => {
    const repository = {
      findActionablePengajuan: jest.fn().mockResolvedValue([]),
      findActiveRecipients: jest.fn().mockResolvedValue([]),
      findExistingReminders: jest.fn().mockResolvedValue([
        {
          pengingatWhatsAppId: 'stale',
          pengajuanEvaluasiId: 'p-1',
          penggunaId: 'u-1',
          jenis: JenisPengingatWhatsApp.EVALUASI_SOP,
        },
      ]),
      upsertDesiredReminder: jest.fn(),
      deleteReminderIds: jest.fn().mockResolvedValue(1),
    } as unknown as WhatsappReminderRepository;
    const resolver = { resolve: jest.fn() } as unknown as WhatsappRecipientResolverService;
    const service = new WhatsappReminderReconcilerService(repository, resolver);

    await service.reconcile();
    expect(repository.deleteReminderIds).toHaveBeenCalledWith(['stale']);
    expect(repository.upsertDesiredReminder).not.toHaveBeenCalled();
  });
});
