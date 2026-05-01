/**
 * Auth API service
 * Matches server: AuthController
 * Note: Authentication tokens are stored in HttpOnly cookies (backend-managed)
 */

import { apiClient } from '@/lib/api/api-client'
import type { LoginResponse } from '@/types/dto/auth.dto'
import type { ChangePasswordDto, LoginRequestDto } from '@/types/dto/auth.dto'

export const authApi = {
  /**
   * AUTH-01: Login with email and password
   * Backend sets HttpOnly cookies for access_token and refresh_token
   */
  login: (payload: LoginRequestDto) =>
    apiClient.post<LoginResponse>('/login', payload),

  /**
   * AUTH-02: Refresh access token
   * New tokens are set via HttpOnly cookies automatically.
   * Returns { success: true } on success.
   */
  refresh: () =>
    apiClient.post<{ success: true }>('/refresh'),

  /**
   * AUTH-06: Change password for logged-in user
   */
  changePassword: (payload: ChangePasswordDto) =>
    apiClient.patch<{ message: string }>('/change-password', payload),

  /**
   * Logout - calls server to clear HttpOnly cookies
   */
  logout: async () => {
    try {
      await apiClient.post<{ message: string }>('/logout')
    } catch {
      // Continue with local cleanup even if server call fails
    }
    // Note: Token cleanup is handled by backend (HttpOnly cookies)
  },
}

import { useMutation } from "@tanstack/react-query";
import { useAuthStore, ensureAuthHydrated } from "@/stores/authStore";
import { useToast, showErrorMessages } from "@/hooks/useToast";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ROUTES } from "@/utils/constants";

export function useAuth() {
  const navigate = useNavigate();
  const { redirect = "/" } = useSearch({ strict: false }) as { redirect?: string };
  const { showToast } = useToast();
  // Use selectors with shallow comparison for optimal performance
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequestDto) => authApi.login(payload),
    onSuccess: async (response) => {

      setUser({
        id: response.user.id,
        email: response.user.email,
        nama: response.user.nama,
        peran: response.user.peran,
        opdId: response.user.opdId,
        nip: response.user.nip,
        jabatan: response.user.jabatan,
      });

      showToast(`Selamat datang, ${response.user.nama}!`, "success");

      try {
        await ensureAuthHydrated(1000);
        navigate({ to: redirect || ROUTES.HOME });
      } catch {
        // Fallback: navigate anyway after a short delay
        setTimeout(() => {
          navigate({ to: redirect || ROUTES.HOME });
        }, 100);
      }
    },
    onError: (error: Error) => {
      showErrorMessages(error, "Login gagal");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordDto) => authApi.changePassword(payload),
    onSuccess: () => showToast("Kata sandi berhasil diubah", "success"),
    onError: (error: Error) => {
      showErrorMessages(error, "Gagal mengubah kata sandi");
    },
  });

  const logoutHandler = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue with local cleanup even if server call fails
    }
    logout();
  };

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    logout: logoutHandler,
  };
}
