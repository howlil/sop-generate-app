/**
 * Hook Tests: useAuth
 * Tests for authentication hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import { useAuthStore } from '@/stores/authStore';
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

describe('useAuth Hook', () => {
  beforeEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  describe('Mutation: Login', () => {
    it('should login successfully with valid credentials', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await result.current.login({
        email: 'tim-penyusun@example.com',
        kataSandi: 'password123',
      });

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith(
        'Selamat datang, Tim Penyusun Test!',
        'success'
      );
    });

    it('should handle invalid credentials', async () => {
      server.use(
        http.post('/api/v1/login', () => {
          return HttpResponse.json(
            { error: 'Email atau kata sandi salah' },
            { status: 401 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await result.current.login({
        email: 'wrong@example.com',
        kataSandi: 'wrongpassword',
      });

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith(
        'Email atau kata sandi salah',
        'error'
      );
    });

    it('should handle server error', async () => {
      server.use(
        http.post('/api/v1/login', () => {
          return HttpResponse.json(
            { error: 'Server error' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await result.current.login({
        email: 'test@example.com',
        kataSandi: 'password123',
      });

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(false);
      });

      expect(showToast).toHaveBeenCalled();
    });
  });

  describe('Mutation: Change Password', () => {
    it('should change password successfully', async () => {
      server.use(
        http.patch('/api/v1/change-password', () => {
          return HttpResponse.json({ message: 'Success' });
        })
      );

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await result.current.changePassword({
        kataSandiLama: 'oldpassword',
        kataSandiBaru: 'newpassword',
      });

      await waitFor(() => {
        expect(result.current.isChangingPassword).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith(
        'Kata sandi berhasil diubah',
        'success'
      );
    });

    it('should handle wrong old password', async () => {
      server.use(
        http.patch('/api/v1/change-password', () => {
          return HttpResponse.json(
            { error: 'Kata sandi lama salah' },
            { status: 401 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await result.current.changePassword({
        kataSandiLama: 'wrongpassword',
        kataSandiBaru: 'newpassword',
      });

      await waitFor(() => {
        expect(result.current.isChangingPassword).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith(
        'Kata sandi lama salah',
        'error'
      );
    });
  });
});
