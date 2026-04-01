/**
 * useAuth hook dengan TanStack Query
 */

import { useMutation } from '@tanstack/react-query'
import { authApi, type LoginRequest } from '@/services/auth.api'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/stores/uiStore'
import { apiClient } from '@/services/api'

export function useAuth() {
  const { setUser, setToken, logout } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (response) => {
      // Simpan token
      apiClient.setToken(response.accessToken)
      setToken(response.accessToken)
      
      // Simpan user info
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
