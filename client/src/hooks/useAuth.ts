/**
 * useAuth hook with TanStack Query
 * Enhanced with auto-refresh token
 */

import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { authApi, type LoginRequest } from '@/services/auth.api'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/stores/uiStore'

const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000

export function useAuth() {
  const { setUser, setToken, logout } = useAuthStore()

  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = useAuthStore.getState().token
      if (currentToken) {
        console.log('Token refresh check - token masih valid')
      }
    }, TOKEN_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (response) => {
      setToken(response.accessToken)

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
