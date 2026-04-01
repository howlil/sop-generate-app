/**
 * Store Tests: Auth Store
 * Tests for authentication Zustand store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  describe('Initial state', () => {
    it('should have null user initially', () => {
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should have null token initially', () => {
      expect(useAuthStore.getState().token).toBeNull();
    });

    it('should have isAuthenticated false initially', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and update isAuthenticated', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        nama: 'Test User',
        peran: 'TIM_PENYUSUN',
        opdId: 'opd-1',
        nip: '123456',
        jabatan: 'Staff',
      };

      useAuthStore.getState().setUser(mockUser);

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should set isAuthenticated to false when user is null', () => {
      useAuthStore.getState().setUser(null);

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('setToken', () => {
    it('should set token in state and localStorage', () => {
      useAuthStore.getState().setToken('test-token');

      expect(useAuthStore.getState().token).toBe('test-token');
      expect(localStorage.getItem('biro-organisasi-token')).toBe('test-token');
    });

    it('should clear token from state and localStorage when null', () => {
      useAuthStore.getState().setToken('test-token');
      useAuthStore.getState().setToken(null);

      expect(useAuthStore.getState().token).toBeNull();
      expect(localStorage.getItem('biro-organisasi-token')).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear user, token, and isAuthenticated', () => {
      // Set initial state
      useAuthStore.getState().setUser({
        id: 'user-1',
        email: 'test@example.com',
        nama: 'Test User',
        peran: 'TIM_PENYUSUN',
        opdId: 'opd-1',
        nip: '123456',
        jabatan: 'Staff',
      });
      useAuthStore.getState().setToken('test-token');

      // Logout
      useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(localStorage.getItem('biro-organisasi-token')).toBeNull();
    });
  });

  describe('Selectors', () => {
    it('should select user correctly', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        nama: 'Test User',
        peran: 'TIM_PENYUSUN',
        opdId: 'opd-1',
        nip: '123456',
        jabatan: 'Staff',
      };
      useAuthStore.getState().setUser(mockUser);

      const user = useAuthStore.getState().user;
      expect(user).toEqual(mockUser);
    });

    it('should select isAuthenticated correctly', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      useAuthStore.getState().setUser({
        id: 'user-1',
        email: 'test@example.com',
        nama: 'Test User',
        peran: 'TIM_PENYUSUN',
        opdId: 'opd-1',
        nip: '123456',
        jabatan: 'Staff',
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should select role correctly', () => {
      useAuthStore.getState().setUser({
        id: 'user-1',
        email: 'test@example.com',
        nama: 'Test User',
        peran: 'TIM_PENYUSUN',
        opdId: 'opd-1',
        nip: '123456',
        jabatan: 'Staff',
      });

      expect(useAuthStore.getState().user?.peran).toBe('TIM_PENYUSUN');
    });
  });

  describe('getRole helper', () => {
    it('should return current user from store', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        nama: 'Test User',
        peran: 'TIM_PENYUSUN',
        opdId: 'opd-1',
        nip: '123456',
        jabatan: 'Staff',
      };
      useAuthStore.getState().setUser(mockUser);

      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('should return null when no user', () => {
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
