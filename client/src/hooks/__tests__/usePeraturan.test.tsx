/**
 * Hook Tests: usePeraturan
 * Tests for Peraturan data fetching and mutations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePeraturan } from '@/hooks/usePeraturan';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import { showToast } from '@/stores/uiStore';

vi.mock('@/stores/uiStore', () => ({
  showToast: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePeraturan Hook', () => {
  beforeEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  describe('Query: Peraturan List', () => {
    it('should fetch peraturan list successfully', async () => {
      const { result } = renderHook(() => usePeraturan(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.list).toHaveLength(1);
      expect(result.current.list[0].namaPeraturan).toBe('Peraturan Test 1');
      expect(result.current.list[0].status).toBe('BERLAKU');
    });

    it('should filter by opdId when provided', async () => {
      const { result } = renderHook(() => usePeraturan('opd-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.list).toBeDefined();
    });

    it('should handle API error', async () => {
      server.use(
        http.get('/api/v1/peraturan', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        })
      );

      const { result } = renderHook(() => usePeraturan(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.list).toHaveLength(0);
    });
  });

  describe('Mutation: Create Peraturan', () => {
    it('should create peraturan successfully', async () => {
      server.use(
        http.post('/api/v1/peraturan', () => {
          return HttpResponse.json(
            {
              id: 'peraturan-new',
              opdId: 'opd-1',
              namaPeraturan: 'Peraturan Baru',
              nomor: '456',
              tahun: 2026,
              tentang: 'Peraturan Baru Test',
              status: 'BERLAKU',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { status: 201 }
          );
        })
      );

      const { result } = renderHook(() => usePeraturan(), { wrapper: createWrapper() });

      await result.current.create({
        opdId: 'opd-1',
        namaPeraturan: 'Peraturan Baru',
        nomor: '456',
        tahun: 2026,
        tentang: 'Peraturan Baru Test',
      });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith('Peraturan berhasil ditambahkan', 'success');
    });
  });

  describe('Mutation: Update Peraturan', () => {
    it('should update peraturan successfully', async () => {
      server.use(
        http.patch('/api/v1/peraturan/:id', () => {
          return HttpResponse.json({
            id: 'peraturan-1',
            opdId: 'opd-1',
            namaPeraturan: 'Peraturan Updated',
            nomor: '123',
            tahun: 2024,
            tentang: 'Updated Regulation',
            status: 'BERLAKU',
            createdAt: '2026-04-01T00:00:00Z',
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const { result } = renderHook(() => usePeraturan(), { wrapper: createWrapper() });

      await result.current.update('peraturan-1', {
        namaPeraturan: 'Peraturan Updated',
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith('Peraturan berhasil diperbarui', 'success');
    });
  });

  describe('Mutation: Revoke Peraturan', () => {
    it('should revoke peraturan successfully', async () => {
      server.use(
        http.patch('/api/v1/peraturan/:id/revoke', () => {
          return HttpResponse.json({
            id: 'peraturan-1',
            opdId: 'opd-1',
            namaPeraturan: 'Peraturan Test 1',
            nomor: '123',
            tahun: 2024,
            tentang: 'Test Regulation',
            status: 'DICABUT',
            createdAt: '2026-04-01T00:00:00Z',
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const { result } = renderHook(() => usePeraturan(), { wrapper: createWrapper() });

      await result.current.revoke('peraturan-1');

      await waitFor(() => {
        expect(result.current.isRevoking).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith('Peraturan berhasil dicabut', 'success');
    });
  });

  describe('Mutation: Delete Peraturan', () => {
    it('should delete peraturan successfully', async () => {
      server.use(
        http.delete('/api/v1/peraturan/:id', () => {
          return HttpResponse.json(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => usePeraturan(), { wrapper: createWrapper() });

      await result.current.delete('peraturan-1');

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith('Peraturan berhasil dihapus', 'success');
    });

    it('should handle delete error when peraturan is used', async () => {
      server.use(
        http.delete('/api/v1/peraturan/:id', () => {
          return HttpResponse.json(
            { error: 'Peraturan masih dipakai sebagai DasarHukum' },
            { status: 409 }
          );
        })
      );

      const { result } = renderHook(() => usePeraturan(), { wrapper: createWrapper() });

      await result.current.delete('peraturan-1');

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(showToast).toHaveBeenCalled();
    });
  });
});
