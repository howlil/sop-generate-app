import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WhatsappMessageFactory } from './whatsapp-message.factory';
import { WhatsappRecipientResolverService } from './whatsapp-recipient-resolver.service';
import { WhatsappReminderReconcilerService } from './whatsapp-reminder-reconciler.service';
import { WhatsappReminderRepository } from './whatsapp-reminder.repository';
import { WhatsappReminderSchedulerService } from './whatsapp-reminder-scheduler.service';
import { WhatsappReminderWorkerService } from './whatsapp-reminder-worker.service';
import { EvolutionApiProvider } from './providers/evolution-api.provider';
import { WHATSAPP_PROVIDER } from './providers/whatsapp-provider.interface';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    WhatsappMessageFactory,
    WhatsappRecipientResolverService,
    WhatsappReminderRepository,
    WhatsappReminderReconcilerService,
    WhatsappReminderWorkerService,
    WhatsappReminderSchedulerService,
    EvolutionApiProvider,
    { provide: WHATSAPP_PROVIDER, useExisting: EvolutionApiProvider },
  ],
})
export class WhatsappNotificationModule {}
