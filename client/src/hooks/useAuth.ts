/**
 * useAuth hook with TanStack Query
 * Note: Token handled via HttpOnly cookies (backend-managed)
 */

import { useMutation } from '@tanstack/react-query'
import { authApi, type LoginRequest } from '@/services/auth.api'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/stores/uiStore'

export function useAuth() {
  const { setUser, logout } = useAuthStore()

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
      const message = error.message || 'Login gagal'
      showToast(message, 'error')
      throw error
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: ({ kataSandiLama, kataSandiBaru }: { kataSandiLama: string; kataSandiBaru: string }) =>
      authApi.changePassword(kataSandiLama, kataSandiBaru),
    onSuccess: () => {
      showToast('Kata sandi berhasil diubah', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal mengubah kata sandi', 'error')
    },
  })

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    logout,
  }
}
