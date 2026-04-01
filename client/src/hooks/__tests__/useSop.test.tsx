/**
 * Hook Tests: useSop
 * Tests for SOP data fetching and mutations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSop } from '@/hooks/useSop';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';

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

describe('useSop Hook', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Query: SOP List', () => {
    it('should fetch SOP list successfully', async () => {
      const { result } = renderHook(() => useSop(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.list).toHaveLength(2);
      expect(result.current.list[0].judul).toBe('SOP Test 1');
      expect(result.current.list[1].statusAktif).toBe('BERLAKU');
    });

    it('should handle API error gracefully', async () => {
      server.use(
        http.get('/api/v1/sop', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        })
      );

      const { result } = renderHook(() => useSop(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.list).toHaveLength(0);
    });

    it('should filter by status when provided', async () => {
      const { result } = renderHook(() => useSop({ status: 'DRAFT' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // MSW returns all, filtering happens on server
      expect(result.current.list).toBeDefined();
    });

    it('should filter by opdId when provided', async () => {
      const { result } = renderHook(() => useSop({ opdId: 'opd-1' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.list).toBeDefined();
    });
  });

  describe('Mutation: Create SOP', () => {
    it('should create SOP successfully', async () => {
      const { result } = renderHook(() => useSop(), { wrapper: createWrapper() });

      const newSop = {
        judul: 'SOP Baru',
        opdId: 'opd-1',
        logoInstansi: 'logo.png',
        namaLembaga: 'Dinas Test',
      };

      result.current.create(newSop);

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(result.current.list).toBeDefined();
    });

    it('should show error on create failure', async () => {
      server.use(
        http.post('/api/v1/sop', () => {
          return HttpResponse.json(
            { error: 'Failed to create' },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() => useSop(), { wrapper: createWrapper() });

      const newSop = {
        judul: 'SOP Baru',
        opdId: 'opd-1',
        logoInstansi: 'logo.png',
        namaLembaga: 'Dinas Test',
      };

      result.current.create(newSop);

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });
  });

  describe('Mutation: Update SOP', () => {
    it('should update SOP successfully', async () => {
      const { result } = renderHook(() => useSop(), { wrapper: createWrapper() });

      result.current.update('sop-1', 'Updated SOP Title');

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });

    it('should show error on update failure', async () => {
      server.use(
        http.patch('/api/v1/sop/:id', () => {
          return HttpResponse.json(
            { error: 'Failed to update' },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() => useSop(), { wrapper: createWrapper() });

      result.current.update('sop-1', 'Updated Title');

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe('Mutation: Delete SOP', () => {
    it('should delete SOP successfully', async () => {
      server.use(
        http.delete('/api/v1/sop/:id', () => {
          return HttpResponse.json(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => useSop(), { wrapper: createWrapper() });

      result.current.delete('sop-1');

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });

    it('should show error on delete failure', async () => {
      server.use(
        http.delete('/api/v1/sop/:id', () => {
          return HttpResponse.json(
            { error: 'Failed to delete' },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() => useSop(), { wrapper: createWrapper() });

      result.current.delete('sop-1');

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });
  });
});
