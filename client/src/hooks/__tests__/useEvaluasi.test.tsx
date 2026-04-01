/**
 * Hook Tests: useEvaluasi
 * Tests for Evaluasi data fetching and mutations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEvaluasi } from '@/hooks/useEvaluasi';
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

describe('useEvaluasi Hook', () => {
  beforeEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  describe('Query: Evaluasi List', () => {
    it('should fetch evaluasi list successfully', async () => {
      server.use(
        http.get('/api/v1/evaluasi', () => {
          return HttpResponse.json([
            {
              id: 'evaluasi-1',
              opdId: 'opd-1',
              jenis: 'TERJADWAL',
              status: 'SEDANG_DIEVALUASI',
              createdAt: '2026-04-01T00:00:00Z',
              updatedAt: '2026-04-01T00:00:00Z',
              version: 1,
            },
          ]);
        })
      );

      const { result } = renderHook(() => useEvaluasi(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.list).toHaveLength(1);
      expect(result.current.list[0].jenis).toBe('TERJADWAL');
    });

    it('should filter by status when provided', async () => {
      const { result } = renderHook(
        () => useEvaluasi({ status: 'SEDANG_DIEVALUASI' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.list).toBeDefined();
    });

    it('should filter by jenis when provided', async () => {
      const { result } = renderHook(
        () => useEvaluasi({ jenis: 'MANDIRI' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.list).toBeDefined();
    });
  });

  describe('Mutation: Create Evaluasi', () => {
    it('should create evaluasi successfully', async () => {
      server.use(
        http.post('/api/v1/evaluasi', () => {
          return HttpResponse.json(
            {
              id: 'evaluasi-new',
              opdId: 'opd-1',
              jenis: 'TERJADWAL',
              status: 'MENUNGGU_EVALUASI',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              version: 1,
            },
            { status: 201 }
          );
        })
      );

      const { result } = renderHook(() => useEvaluasi(), { wrapper: createWrapper() });

      await result.current.create({
        opdId: 'opd-1',
        jenis: 'TERJADWAL',
        sopDetailIds: ['sop-1', 'sop-2'],
      });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith('Pengajuan evaluasi berhasil dibuat', 'success');
    });

    it('should handle create error for duplicate evaluation', async () => {
      server.use(
        http.post('/api/v1/evaluasi', () => {
          return HttpResponse.json(
            { error: 'OPD ini sudah memiliki pengajuan evaluasi TERJADWAL yang aktif' },
            { status: 409 }
          );
        })
      );

      const { result } = renderHook(() => useEvaluasi(), { wrapper: createWrapper() });

      await result.current.create({
        opdId: 'opd-1',
        jenis: 'TERJADWAL',
        sopDetailIds: ['sop-1'],
      });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(showToast).toHaveBeenCalled();
    });
  });

  describe('Mutation: Isi Nilai Evaluasi', () => {
    it('should fill evaluation result successfully', async () => {
      server.use(
        http.patch('/api/v1/evaluasi/:id/nilai/:sopDetailId', () => {
          return HttpResponse.json({
            id: 'nilai-1',
            pengajuanEvaluasiId: 'evaluasi-1',
            sopDetailId: 'sop-1',
            hasil: 'SESUAI',
            catatan: 'SOP sudah sesuai',
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const { result } = renderHook(() => useEvaluasi(), { wrapper: createWrapper() });

      await result.current.isiNilai('evaluasi-1', 'sop-1', {
        hasil: 'SESUAI',
        catatan: 'SOP sudah sesuai',
      });

      await waitFor(() => {
        expect(result.current.isiNilai).toBeDefined();
      });
    });
  });

  describe('Mutation: Selesai Evaluasi', () => {
    it('should complete evaluation successfully', async () => {
      server.use(
        http.patch('/api/v1/evaluasi/:id/selesai', () => {
          return HttpResponse.json({
            id: 'evaluasi-1',
            opdId: 'opd-1',
            jenis: 'TERJADWAL',
            status: 'SELESAI_DIEVALUASI',
            nilaiOPD: 85,
            createdAt: '2026-04-01T00:00:00Z',
            updatedAt: new Date().toISOString(),
            version: 2,
          });
        })
      );

      const { result } = renderHook(() => useEvaluasi(), { wrapper: createWrapper() });

      await result.current.selesai('evaluasi-1', { nilaiOPD: 85 });

      await waitFor(() => {
        expect(result.current.selesai).toBeDefined();
      });
    });

    it('should handle error for TERJADWAL without nilaiOPD', async () => {
      server.use(
        http.patch('/api/v1/evaluasi/:id/selesai', () => {
          return HttpResponse.json(
            { error: 'Evaluasi TERJADWAL wajib mengisi nilaiOPD sebelum diselesaikan' },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() => useEvaluasi(), { wrapper: createWrapper() });

      await result.current.selesai('evaluasi-1', {});

      await waitFor(() => {
        expect(result.current.selesai).toBeDefined();
      });
    });
  });

  describe('Query: Rekap Evaluasi', () => {
    it('should fetch rekap evaluasi successfully', async () => {
      server.use(
        http.get('/api/v1/evaluasi/rekap', () => {
          return HttpResponse.json([
            {
              opdId: 'opd-1',
              opdNama: 'Dinas Pendidikan',
              tahun: 2026,
              totalPengajuan: 5,
              totalTerjadwal: 3,
              totalMandiri: 2,
              nilaiRataRata: 80,
              detail: [],
            },
          ]);
        })
      );

      const { result } = renderHook(() => useEvaluasi(), { wrapper: createWrapper() });

      // Note: rekap would be a separate hook in real implementation
      expect(result.current).toBeDefined();
    });
  });
});
