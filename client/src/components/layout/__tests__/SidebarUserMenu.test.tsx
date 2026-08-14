import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const navigate = vi.fn()
const logout = vi.fn().mockResolvedValue(undefined)

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
}))

vi.mock('@/hooks/useAppRole', () => ({
  useAppRole: () => ({
    role: 'PJ_PENYUSUN',
    getRoleLabel: () => 'PJ Penyusun',
    getRoleNip: () => '123456789',
    getRoleDisplayName: () => 'Pengguna Uji',
  }),
}))

vi.mock('@/api/auth', () => ({
  useAuth: () => ({ logout }),
}))

vi.mock('@/utils/role-routing', () => ({
  getMeRoute: () => '/penyusun/me',
}))

import { SidebarUserMenu } from '@/components/layout/SidebarUserMenu'

describe('SidebarUserMenu', () => {
  it('menampilkan identitas ringkas dan detail akun di menu', () => {
    render(<SidebarUserMenu />)

    expect(screen.getByText('Pengguna Uji')).toBeInTheDocument()
    expect(screen.getByText('PJ Penyusun')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Menu profil Pengguna Uji' }))

    expect(screen.getByText('NIP. 123456789')).toBeInTheDocument()
    expect(screen.getByText('Profil Saya')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('tetap dapat diakses saat sidebar collapsed tanpa menampilkan label visual', () => {
    render(<SidebarUserMenu collapsed />)

    expect(screen.getByRole('button', { name: 'Menu profil Pengguna Uji' })).toBeInTheDocument()
    expect(screen.getByText('Pengguna Uji')).toHaveClass('sr-only')
  })

  it('menavigasi ke profil dan menjalankan logout melalui menu yang sama', async () => {
    const onNavigate = vi.fn()
    render(<SidebarUserMenu onNavigate={onNavigate} />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu profil Pengguna Uji' }))
    fireEvent.click(screen.getByText('Profil Saya'))
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith({ to: '/penyusun/me' })

    fireEvent.click(screen.getByRole('button', { name: 'Menu profil Pengguna Uji' }))
    fireEvent.click(screen.getByText('Logout'))

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1))
    expect(onNavigate).toHaveBeenCalledTimes(2)
    expect(navigate).toHaveBeenLastCalledWith({
      to: '/',
      search: { denied: undefined, redirect: undefined },
    })
  })
})
