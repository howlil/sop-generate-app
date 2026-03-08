/**
 * Konfigurasi sumber data (mock vs API).
 * - Dev: gunakan data dari seed/data/*.json (mock response API).
 * - Staging/Prod: set VITE_USE_MOCK=false dan VITE_API_BASE_URL; data diambil dari API.
 * Bentuk data di JSON sengaja mengikuti response API agar ganti ke API tinggal ganti sumber.
 */

export const USE_MOCK =
  typeof import.meta.env.VITE_USE_MOCK !== 'undefined'
    ? import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === '1'
    : true

export const API_BASE_URL =
  (typeof import.meta.env.VITE_API_BASE_URL === 'string' && import.meta.env.VITE_API_BASE_URL) ||
  ''
