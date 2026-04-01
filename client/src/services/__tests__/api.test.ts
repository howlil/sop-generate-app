/**
 * Service Tests: API Client
 * Tests for the HTTP client service
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { apiClient, ApiError } from '@/services/api';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';

// Setup MSW for API tests
beforeEach(() => {
  server.listen();
  localStorage.clear();
});

afterEach(() => {
  server.resetHandlers();
  server.close();
});

describe('API Client', () => {
  describe('GET requests', () => {
    it('should make GET request successfully', async () => {
      server.use(
        http.get('/api/v1/test', () => {
          return HttpResponse.json({ data: 'test' });
        })
      );

      const result = await apiClient.get('/test');
      expect(result).toEqual({ data: 'test' });
    });

    it('should include auth token when available', async () => {
      localStorage.setItem('biro-organisasi-token', 'test-token');
      
      server.use(
        http.get('/api/v1/test', ({ request }) => {
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBe('Bearer test-token');
          return HttpResponse.json({ data: 'test' });
        })
      );

      await apiClient.get('/test');
    });

    it('should handle API errors', async () => {
      server.use(
        http.get('/api/v1/not-found', () => {
          return HttpResponse.json({ message: 'Not found' }, { status: 404 });
        })
      );

      await expect(apiClient.get('/not-found')).rejects.toThrow(ApiError);
      await expect(apiClient.get('/not-found')).rejects.toMatchObject({
        status: 404,
        message: 'Not found',
      });
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body', async () => {
      server.use(
        http.post('/api/v1/create', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ name: 'Test' });
          return HttpResponse.json({ id: '1', name: 'Created' }, { status: 201 });
        })
      );

      const result = await apiClient.post('/create', { name: 'Test' });
      expect(result).toEqual({ id: '1', name: 'Created' });
    });

    it('should handle POST without body', async () => {
      server.use(
        http.post('/api/v1/create', () => {
          return HttpResponse.json({ id: '1' }, { status: 201 });
        })
      );

      await apiClient.post('/create');
    });
  });

  describe('PATCH requests', () => {
    it('should make PATCH request with body', async () => {
      server.use(
        http.patch('/api/v1/update', async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({ id: '1', updated: true });
        })
      );

      const result = await apiClient.patch('/update', { name: 'Updated' });
      expect(result).toEqual({ id: '1', updated: true });
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request successfully', async () => {
      server.use(
        http.delete('/api/v1/delete', () => {
          return HttpResponse.json(null, { status: 204 });
        })
      );

      const result = await apiClient.delete('/delete');
      expect(result).toBeUndefined();
    });
  });

  describe('Token management', () => {
    it('should set token in localStorage', () => {
      apiClient.setToken('new-token');
      expect(localStorage.getItem('biro-organisasi-token')).toBe('new-token');
    });

    it('should clear token from localStorage', () => {
      localStorage.setItem('biro-organisasi-token', 'existing-token');
      apiClient.clearToken();
      expect(localStorage.getItem('biro-organisasi-token')).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should create ApiError with status and message', () => {
      const error = new ApiError(500, 'Server error');
      expect(error.status).toBe(500);
      expect(error.message).toBe('Server error');
      expect(error.name).toBe('ApiError');
    });

    it('should handle fetch errors without message', async () => {
      server.use(
        http.get('/api/v1/error', () => {
          return HttpResponse.json({}, { status: 500 });
        })
      );

      await expect(apiClient.get('/error')).rejects.toThrow('HTTP 500');
    });
  });
});
