import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationDeliveryRepository } from './deliveries/notification-delivery.repository';
import { NotificationDeliveryService } from './deliveries/notification-delivery.service';
import { PushReminderWorkerService } from './push-reminder-worker.service';
import { InAppNotificationController } from './in-app-notification.controller';
import { InAppNotificationService } from './in-app-notification.service';
import { NotificationEventsService } from './notification-events.service';
import { ReminderMessageFactory } from './reminder-message.factory';
import { NotificationRecipientResolverService } from './notification-recipient-resolver.service';
import { NotificationReminderReconcilerService } from './notification-reminder-reconciler.service';
import { NotificationReminderRepository } from './notification-reminder.repository';
import { NotificationReminderSchedulerService } from './notification-reminder-scheduler.service';
import { NOTIFICATION_CHANNEL } from './providers/notification-channel.interface';
import { WagoProvider } from './providers/wago.provider';
import { WagoWebhookRepository } from './webhooks/wago-webhook.repository';
import { WagoWebhookService } from './webhooks/wago-webhook.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [InAppNotificationController],
  providers: [
    NotificationEventsService,
    ReminderMessageFactory,
    NotificationRecipientResolverService,
    NotificationReminderRepository,
    NotificationReminderReconcilerService,
    NotificationDeliveryRepository,
    WagoWebhookRepository,
    WagoWebhookService,
    NotificationDeliveryService,
    PushReminderWorkerService,
    InAppNotificationService,
    NotificationReminderSchedulerService,
    WagoProvider,
    { provide: NOTIFICATION_CHANNEL, useExisting: WagoProvider },
  ],
})
export class NotificationModule {}
