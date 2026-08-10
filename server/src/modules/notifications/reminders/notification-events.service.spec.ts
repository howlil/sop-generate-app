import { firstValueFrom, take } from 'rxjs';
import { NotificationEventsService } from './notification-events.service';

describe('NotificationEventsService', () => {
  it('emitChanged menggunakan pengguna null secara default', async () => {
    const service = new NotificationEventsService();
    const eventPromise = firstValueFrom(service.events$.pipe(take(1)));

    service.emitChanged();

    const event = await eventPromise;
    expect(event).toMatchObject({ penggunaId: null, type: 'changed' });
    expect(Number.isNaN(Date.parse(event.at))).toBe(false);
  });

  it('emitChanged mempertahankan pengguna target ketika diberikan', async () => {
    const service = new NotificationEventsService();
    const eventPromise = firstValueFrom(service.events$.pipe(take(1)));

    service.emitChanged('user-1');

    await expect(eventPromise).resolves.toMatchObject({
      penggunaId: 'user-1',
      type: 'changed',
    });
  });

  it('emitHeartbeat menggunakan pengguna null secara default', async () => {
    const service = new NotificationEventsService();
    const eventPromise = firstValueFrom(service.events$.pipe(take(1)));

    service.emitHeartbeat();

    await expect(eventPromise).resolves.toMatchObject({
      penggunaId: null,
      type: 'heartbeat',
    });
  });

  it('emitHeartbeat mempertahankan pengguna target ketika diberikan', async () => {
    const service = new NotificationEventsService();
    const eventPromise = firstValueFrom(service.events$.pipe(take(1)));

    service.emitHeartbeat('user-2');

    await expect(eventPromise).resolves.toMatchObject({
      penggunaId: 'user-2',
      type: 'heartbeat',
    });
  });
});
