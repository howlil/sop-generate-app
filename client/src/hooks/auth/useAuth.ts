/**
 * useAuth hook with TanStack Query
 * Note: Token handled via HttpOnly cookies (backend-managed)
 * Uses Zustand selectors for optimal performance.
 */

import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/services/auth.api'
import type { LoginRequest } from '@/types/auth'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/stores/uiStore'
import { withMutationToast } from '@/utils/handleApi'
import { shallow } from 'zustand/shallow'

export function useAuth() {
  // Use selectors with shallow comparison for optimal performance
  const setUser = useAuthStore((state) => state.setUser, shallow)
  const logout = useAuthStore((state) => state.logout, shallow)

  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (response) => {
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
      })

      showToast(`Selamat datang, ${response.user.nama}!`, 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Login gagal', 'error')
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: ({ kataSandiLama, kataSandiBaru }: { kataSandiLama: string; kataSandiBaru: string }) =>
      authApi.changePassword(kataSandiLama, kataSandiBaru),
    ...withMutationToast('Kata sandi berhasil diubah', 'Gagal mengubah kata sandi'),
  })

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    logout,
  }
}
