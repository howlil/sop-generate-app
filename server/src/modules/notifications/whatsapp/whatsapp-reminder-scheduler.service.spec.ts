/* eslint-disable @typescript-eslint/unbound-method */
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { WhatsappReminderReconcilerService } from './whatsapp-reminder-reconciler.service';
import { WhatsappReminderSchedulerService } from './whatsapp-reminder-scheduler.service';
import { WhatsappReminderWorkerService } from './whatsapp-reminder-worker.service';

function build(enabled: boolean) {
  const schedulerRegistry = {
    addInterval: jest.fn(),
    doesExist: jest.fn().mockReturnValue(true),
    deleteInterval: jest.fn(),
  } as unknown as SchedulerRegistry;
  const reconciler = {
    reconcile: jest.fn().mockResolvedValue({ desired: 0, deleted: 0 }),
  } as unknown as WhatsappReminderReconcilerService;
  const worker = {
    processDue: jest.fn().mockResolvedValue({ candidates: 0, processed: 0 }),
  } as unknown as WhatsappReminderWorkerService;
  const config = {
    get: jest.fn((key: string, fallback: unknown) => {
      if (key === 'WHATSAPP_ENABLED') return enabled;
      if (key === 'WHATSAPP_RECONCILE_INTERVAL_SECONDS') return 10;
      return fallback;
    }),
  } as unknown as ConfigService;
  return {
    schedulerRegistry,
    reconciler,
    worker,
    service: new WhatsappReminderSchedulerService(schedulerRegistry, reconciler, worker, config),
  };
}

describe('WhatsappReminderSchedulerService', () => {
  afterEach(() => jest.useRealTimers());

  it('tidak membuat interval atau menjalankan pekerjaan ketika fitur nonaktif', async () => {
    const { service, schedulerRegistry, reconciler, worker } = build(false);
    service.onModuleInit();
    await service.tick();
    expect(schedulerRegistry.addInterval).not.toHaveBeenCalled();
    expect(reconciler.reconcile).not.toHaveBeenCalled();
    expect(worker.processDue).not.toHaveBeenCalled();
  });

  it('mendaftarkan interval, menjalankan tick awal, dan membersihkannya saat shutdown', () => {
    jest.useFakeTimers();
    const { service, schedulerRegistry } = build(true);
    const tick = jest.spyOn(service, 'tick').mockResolvedValue(undefined);
    service.onModuleInit();
    expect(schedulerRegistry.addInterval).toHaveBeenCalledWith(
      'whatsapp-reminder-reconcile',
      expect.anything(),
    );
    expect(tick).toHaveBeenCalledTimes(1);
    service.onModuleDestroy();
    expect(schedulerRegistry.deleteInterval).toHaveBeenCalledWith('whatsapp-reminder-reconcile');
  });

  it('mencegah siklus overlap ketika rekonsiliasi sebelumnya belum selesai', async () => {
    const { service, reconciler, worker } = build(true);
    let finishReconcile: (() => void) | undefined;
    (reconciler.reconcile as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        finishReconcile = () => resolve({ desired: 0, deleted: 0 });
      }),
    );
    const first = service.tick();
    await service.tick();
    expect(reconciler.reconcile).toHaveBeenCalledTimes(1);
    expect(worker.processDue).not.toHaveBeenCalled();
    finishReconcile?.();
    await first;
    expect(worker.processDue).toHaveBeenCalledTimes(1);
  });

  it('membuka kembali scheduler setelah satu siklus gagal', async () => {
    const { service, reconciler, worker } = build(true);
    (reconciler.reconcile as jest.Mock)
      .mockRejectedValueOnce(new Error('database unavailable'))
      .mockResolvedValueOnce({ desired: 0, deleted: 0 });
    await expect(service.tick()).resolves.toBeUndefined();
    await expect(service.tick()).resolves.toBeUndefined();
    expect(reconciler.reconcile).toHaveBeenCalledTimes(2);
    expect(worker.processDue).toHaveBeenCalledTimes(1);
  });
});
