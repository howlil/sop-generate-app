import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { WhatsappReminderReconcilerService } from './whatsapp-reminder-reconciler.service';
import { WhatsappReminderWorkerService } from './whatsapp-reminder-worker.service';

const SCHEDULER_NAME = 'whatsapp-reminder-reconcile';

@Injectable()
export class WhatsappReminderSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsappReminderSchedulerService.name);
  private readonly enabled: boolean;
  private readonly intervalMs: number;
  private running = false;

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly reconciler: WhatsappReminderReconcilerService,
    private readonly worker: WhatsappReminderWorkerService,
    config: ConfigService,
  ) {
    this.enabled = config.get<boolean>('WHATSAPP_ENABLED', false);
    this.intervalMs = config.get<number>('WHATSAPP_RECONCILE_INTERVAL_SECONDS', 10) * 1_000;
  }

  onModuleInit(): void {
    if (!this.enabled) {
      this.logger.log('WhatsApp reminder nonaktif');
      return;
    }
    const interval = setInterval(() => void this.tick(), this.intervalMs);
    this.schedulerRegistry.addInterval(SCHEDULER_NAME, interval);
    this.logger.log(`WhatsApp reminder aktif interval=${this.intervalMs}ms`);
    void this.tick();
  }

  onModuleDestroy(): void {
    if (this.schedulerRegistry.doesExist('interval', SCHEDULER_NAME)) {
      this.schedulerRegistry.deleteInterval(SCHEDULER_NAME);
    }
  }

  async tick(): Promise<void> {
    if (!this.enabled || this.running) {
      return;
    }
    this.running = true;
    try {
      await this.reconciler.reconcile();
      await this.worker.processDue();
    } catch (error) {
      this.logger.error(
        `Siklus WhatsApp reminder gagal: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      this.running = false;
    }
  }
}
