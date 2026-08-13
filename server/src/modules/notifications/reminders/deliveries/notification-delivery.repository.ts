import { Injectable } from '@nestjs/common';
import { isPrismaUniqueConstraintError } from '../../../../common/prisma/prisma-error.util';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import {
  type JenisPengingatWhatsApp,
  StatusPengirimanNotifikasiWhatsApp,
} from '../../../../generated/prisma';
import type {
  CreatePendingNotificationDelivery,
  NotificationDeliveryRecord,
  NotificationDeliveryTransition,
} from './notification-delivery.types';

@Injectable()
export class NotificationDeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrGetPending(
    input: CreatePendingNotificationDelivery,
  ): Promise<NotificationDeliveryRecord> {
    const existing = await this.prisma.pengirimanNotifikasiWhatsApp.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (existing) return existing;

    try {
      return await this.prisma.pengirimanNotifikasiWhatsApp.create({
        data: {
          pengingatWhatsAppId: input.notificationReminderId,
          pengajuanEvaluasiId: input.pengajuanEvaluasiId,
          penggunaId: input.penggunaId,
          jenis: input.kind,
          idempotencyKey: input.idempotencyKey,
          transportMessageId: input.transportMessageId,
          submittedAt: input.submittedAt,
        },
      });
    } catch (error) {
      if (!isPrismaUniqueConstraintError(error)) throw error;

      const raced = await this.prisma.pengirimanNotifikasiWhatsApp.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (raced) return raced;
      throw error;
    }
  }

  findByTransportMessageId(messageId: string): Promise<NotificationDeliveryRecord | null> {
    return this.prisma.pengirimanNotifikasiWhatsApp.findUnique({
      where: { transportMessageId: messageId },
    });
  }

  findLatestForIdentity(
    pengajuanEvaluasiId: string,
    penggunaId: string,
    kind: JenisPengingatWhatsApp,
  ): Promise<NotificationDeliveryRecord | null> {
    return this.prisma.pengirimanNotifikasiWhatsApp.findFirst({
      where: {
        pengajuanEvaluasiId,
        penggunaId,
        jenis: kind,
      },
      orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async markAccepted(
    deliveryId: string,
    resolvedAt: Date,
  ): Promise<NotificationDeliveryTransition> {
    const result = await this.prisma.pengirimanNotifikasiWhatsApp.updateMany({
      where: {
        pengirimanNotifikasiWhatsAppId: deliveryId,
        status: StatusPengirimanNotifikasiWhatsApp.PENDING,
      },
      data: {
        status: StatusPengirimanNotifikasiWhatsApp.ACCEPTED,
        errorCode: null,
        resolvedAt,
      },
    });
    return result.count === 1 ? 'updated' : 'already-terminal';
  }

  async markRejected(
    deliveryId: string,
    errorCode: string | null,
    resolvedAt: Date,
  ): Promise<NotificationDeliveryTransition> {
    const result = await this.prisma.pengirimanNotifikasiWhatsApp.updateMany({
      where: {
        pengirimanNotifikasiWhatsAppId: deliveryId,
        status: StatusPengirimanNotifikasiWhatsApp.PENDING,
      },
      data: {
        status: StatusPengirimanNotifikasiWhatsApp.REJECTED,
        errorCode,
        resolvedAt,
      },
    });
    return result.count === 1 ? 'updated' : 'already-terminal';
  }
}
