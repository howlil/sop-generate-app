/**
 * Service Tests: peraturan.api
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { peraturanApi } from '@/services/peraturan.api';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';

beforeEach(() => {
  server.listen();
  localStorage.clear();
});

afterEach(() => {
  server.resetHandlers();
  server.close();
});

describe('peraturanApi', () => {
  describe('findAll', () => {
    it('should fetch peraturan list successfully', async () => {
      server.use(
        http.get('/api/v1/peraturan', () => {
          return HttpResponse.json([
            { id: '1', namaPeraturan: 'Peraturan 1' },
            { id: '2', namaPeraturan: 'Peraturan 2' },
          ]);
        })
      );

      const result = await peraturanApi.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should fetch peraturan by id successfully', async () => {
      server.use(
        http.get('/api/v1/peraturan/:id', () => {
          return HttpResponse.json({ id: '1', namaPeraturan: 'Peraturan 1' });
        })
      );

      const result = await peraturanApi.findById('1');
      expect(result.id).toBe('1');
    });
  });

  describe('create', () => {
    it('should create peraturan successfully', async () => {
      server.use(
        http.post('/api/v1/peraturan', () => {
          return HttpResponse.json({ id: '1', namaPeraturan: 'New Peraturan' }, { status: 201 });
        })
      );

      const result = await peraturanApi.create({
        opdId: '1',
        namaPeraturan: 'New Peraturan',
        nomor: '123',
        tahun: 2024,
        tentang: 'Test',
      });
      expect(result.namaPeraturan).toBe('New Peraturan');
    });
  });

  describe('update', () => {
    it('should update peraturan successfully', async () => {
      server.use(
        http.patch('/api/v1/peraturan/:id', () => {
          return HttpResponse.json({ id: '1', namaPeraturan: 'Updated Peraturan' });
        })
      );

      const result = await peraturanApi.update('1', { namaPeraturan: 'Updated Peraturan' });
      expect(result.namaPeraturan).toBe('Updated Peraturan');
    });
  });

  describe('revoke', () => {
    it('should revoke peraturan successfully', async () => {
      server.use(
        http.patch('/api/v1/peraturan/:id/cabut', () => {
          return HttpResponse.json({ id: '1', status: 'DICABUT' });
        })
      );

      const result = await peraturanApi.revoke('1');
      expect(result.status).toBe('DICABUT');
    });
  });

  describe('delete', () => {
    it('should delete peraturan successfully', async () => {
      server.use(
        http.delete('/api/v1/peraturan/:id', () => {
          return HttpResponse.json(null, { status: 204 });
        })
      );

      const result = await peraturanApi.delete('1');
      expect(result).toBeUndefined();
    });
  });
});
