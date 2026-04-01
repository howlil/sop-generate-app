/**
 * Hook Tests: useOpd
 * Tests for OPD data fetching and mutations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOpd } from '@/hooks/useOpd';
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

describe('useOpd Hook', () => {
  beforeEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  describe('Query: OPD List', () => {
    it('should fetch OPD list successfully', async () => {
      const { result } = renderHook(() => useOpd(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.list).toHaveLength(2);
      expect(result.current.list[0].nama).toBe('Dinas Pendidikan');
      expect(result.current.list[1].nama).toBe('Dinas Kesehatan');
    });

    it('should handle API error', async () => {
      server.use(
        http.get('/api/v1/opd', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        })
      );

      const { result } = renderHook(() => useOpd(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.list).toHaveLength(0);
    });
  });

  describe('Mutation: Create OPD', () => {
    it('should create OPD successfully', async () => {
      server.use(
        http.post('/api/v1/opd', () => {
          return HttpResponse.json(
            {
              id: 'opd-new',
              nama: 'Dinas Baru',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { status: 201 }
          );
        })
      );

      const { result } = renderHook(() => useOpd(), { wrapper: createWrapper() });

      await result.current.create({ nama: 'Dinas Baru' });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith('OPD berhasil ditambahkan', 'success');
    });

    it('should handle create error', async () => {
      server.use(
        http.post('/api/v1/opd', () => {
          return HttpResponse.json(
            { error: 'Failed to create' },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() => useOpd(), { wrapper: createWrapper() });

      await result.current.create({ nama: 'Dinas Baru' });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(showToast).toHaveBeenCalled();
    });
  });

  describe('Mutation: Update OPD', () => {
    it('should update OPD successfully', async () => {
      server.use(
        http.patch('/api/v1/opd/:id', () => {
          return HttpResponse.json({
            id: 'opd-1',
            nama: 'Dinas Updated',
            createdAt: '2026-04-01T00:00:00Z',
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const { result } = renderHook(() => useOpd(), { wrapper: createWrapper() });

      await result.current.update('opd-1', { nama: 'Dinas Updated' });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith('OPD berhasil diperbarui', 'success');
    });
  });

  describe('Mutation: Delete OPD', () => {
    it('should delete OPD successfully', async () => {
      server.use(
        http.delete('/api/v1/opd/:id', () => {
          return HttpResponse.json(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => useOpd(), { wrapper: createWrapper() });

      await result.current.delete('opd-1');

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith('OPD berhasil dinonaktifkan', 'success');
    });

    it('should handle delete error', async () => {
      server.use(
        http.delete('/api/v1/opd/:id', () => {
          return HttpResponse.json(
            { error: 'OPD masih punya pengajuan evaluasi aktif' },
            { status: 409 }
          );
        })
      );

      const { result } = renderHook(() => useOpd(), { wrapper: createWrapper() });

      await result.current.delete('opd-1');

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(showToast).toHaveBeenCalled();
    });
  });
});
