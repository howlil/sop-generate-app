/**
 * useAuth hook with TanStack Query
 * Note: Token handled via HttpOnly cookies (backend-managed)
 * Uses Zustand selectors for optimal performance.
 */

import { useMutation } from "@tanstack/react-query";
import { authApi } from "../services/auth.api";
import type { LoginRequest } from "../types/auth";
import { useAuthStore, ensureAuthHydrated } from "@/stores/authStore";
import { useToast, showErrorMessages } from "@/utils/toast";
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
    mutationFn: (payload: LoginRequest) => {
      console.log('[Auth] Attempting login with:', { email: payload.email });
      return authApi.login(payload);
    },
    onSuccess: async (response) => {
      console.log('[Auth] Login successful:', response.user);
      // Token is stored in HttpOnly cookie by backend
      // No need to store token in frontend

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
      
      // Wait for Zustand persist to finish hydration before navigating
      // This ensures route guards can read the user state from localStorage
      try {
        await ensureAuthHydrated(1000);
        navigate({ to: redirect || ROUTES.HOME });
      } catch (error) {
        console.error('[Auth] Error during navigation after login:', error);
        // Fallback: navigate anyway after a short delay
        setTimeout(() => {
          navigate({ to: redirect || ROUTES.HOME });
        }, 100);
      }
    },
    onError: (error: Error) => {
      console.error('[Auth] Login error:', error);
      showErrorMessages(error, "Login gagal");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({
      kataSandiLama,
      kataSandiBaru,
    }: {
      kataSandiLama: string;
      kataSandiBaru: string;
    }) => authApi.changePassword(kataSandiLama, kataSandiBaru),
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
