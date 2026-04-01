/**
 * Response messages constants
 * Centralized message management for consistent responses
 */

/**
 * Interpolate message placeholders
 * @example interpolate('Hello {name}', { name: 'World' }) => 'Hello World'
 */
export function interpolate(message: string, params: Record<string, any>): string {
  return message.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`);
}

// ==================== AUTH MESSAGES ====================
export const AuthMessages = {
  // Success
  LOGIN_SUCCESS: 'Login berhasil',
  PASSWORD_CHANGED: 'Kata sandi berhasil diubah',
  
  // Error
  INVALID_EMAIL_OR_PASSWORD: 'Email atau kata sandi salah',
  ACCOUNT_DEACTIVATED: 'Akun telah dinonaktifkan',
  USER_NOT_FOUND: 'Pengguna tidak ditemukan',
  INVALID_OLD_PASSWORD: 'Kata sandi lama salah',
  TOKEN_INVALID: 'Token tidak valid atau kadaluarsa',
  TOKEN_EXPIRED: 'Token telah kadaluarsa',
  USER_NOT_AUTHENTICATED: 'User tidak terautentikasi',
} as const;

// ==================== USER MESSAGES ====================
export const UserMessages = {
  // Success
  USER_CREATED: 'Pengguna berhasil dibuat',
  USER_UPDATED: 'Pengguna berhasil diperbarui',
  USER_DELETED: 'Pengguna berhasil dihapus',
  USER_FOUND: 'Data pengguna ditemukan',
  USERS_FOUND: 'Daftar pengguna ditemukan',
  
  // Error
  EMAIL_EXISTS: 'Email sudah terdaftar',
  NIP_EXISTS: 'NIP sudah terdaftar',
  USER_NOT_FOUND: 'Pengguna tidak ditemukan',
  OPD_REQUIRED: 'opdId wajib untuk peran ini',
  EMAIL_ALREADY_REGISTERED: 'Email sudah terdaftar',
} as const;

// ==================== OPD MESSAGES ====================
export const OpdMessages = {
  // Success
  OPD_CREATED: 'OPD berhasil dibuat',
  OPD_UPDATED: 'OPD berhasil diperbarui',
  OPD_DELETED: 'OPD berhasil dinonaktifkan',
  OPD_FOUND: 'Data OPD ditemukan',
  OPDS_FOUND: 'Daftar OPD ditemukan',
  
  // Error
  OPD_NOT_FOUND: 'OPD tidak ditemukan',
  OPD_HAS_ACTIVE_EVALUATION: 'OPD masih punya pengajuan evaluasi aktif',
  OPD_NAME_EXISTS: 'Nama OPD sudah terdaftar',
} as const;

// ==================== SOP MESSAGES ====================
export const SopMessages = {
  // Success
  SOP_CREATED: 'SOP berhasil dibuat',
  SOP_UPDATED: 'SOP berhasil diperbarui',
  SOP_DELETED: 'SOP berhasil dihapus',
  SOP_FOUND: 'Data SOP ditemukan',
  SOPS_FOUND: 'Daftar SOP ditemukan',
  
  // Error
  SOP_NOT_FOUND: 'SOP tidak ditemukan',
  ACCESS_DENIED: 'Akses ditolak',
  SOP_HAS_EVALUATION: 'SOP masih memiliki evaluasi aktif',
  SOP_TITLE_CONFLICT: 'Judul SOP sudah ada di OPD ini',
} as const;

// ==================== DETAIL SOP MESSAGES ====================
export const DetailSopMessages = {
  // Success
  DETAIL_SOP_FOUND: 'Data Detail SOP ditemukan',
  METADATA_UPDATED: 'Metadata Detail SOP berhasil diperbarui',
  STATUS_UPDATED: 'Status Detail SOP berhasil diubah',
  
  // Error
  DETAIL_SOP_NOT_FOUND: 'Detail SOP tidak ditemukan',
  ACCESS_DENIED: 'Akses ditolak',
  CANNOT_UPDATE_TERMINAL_STATUS: 'Status {status} adalah terminal dan tidak dapat diubah',
  EVALUATION_EXISTS: 'SOP ini sudah memiliki evaluasi yang sedang berjalan',
  INVALID_STATUS_TRANSITION: 'Transisi status dari {from} ke {to} tidak valid',
} as const;

// ==================== LANGKAH SOP MESSAGES ====================
export const LangkahSopMessages = {
  // Success
  LANGKAH_CREATED: 'Langkah SOP berhasil ditambahkan',
  LANGKAH_UPDATED: 'Langkah SOP berhasil diperbarui',
  LANGKAH_DELETED: 'Langkah SOP berhasil dihapus',
  LANGKAH_FOUND: 'Langkah SOP ditemukan',
  
  // Error
  LANGKAH_NOT_FOUND: 'Langkah SOP tidak ditemukan',
  TERMINATOR_CANNOT_HAVE_NEXT: 'TERMINATOR tidak boleh memiliki langkah selanjutnya',
  TASK_ONLY_YES_BRANCH: 'TASK hanya boleh memiliki langkahSelanjutnyaYaId',
  PELAKSANA_NOT_IN_SWIMLANE: 'Pelaksana tidak terdaftar di swimlane Detail SOP ini',
  URUTAN_ALREADY_USED: 'Urutan {urutan} sudah digunakan dalam Detail SOP ini',
} as const;

// ==================== PELAKSANA MESSAGES ====================
export const PelaksanaMessages = {
  // Success
  PELAKSANA_FOUND: 'Data Pelaksana ditemukan',
  PELAKSANA_ADDED: 'Pelaksana berhasil ditambahkan',
  PELAKSANA_REMOVED: 'Pelaksana berhasil dihapus',
  
  // Error
  PELAKSANA_NOT_FOUND: 'Pelaksana tidak ditemukan',
  PELAKSANA_IN_USE: 'Pelaksana tidak dapat dihapus karena masih digunakan dalam langkah SOP',
  PELAKSANA_ALREADY_EXISTS: 'Pelaksana sudah terdaftar di swimlane ini',
  PELAKSANA_NOT_IN_SWIMLANE: 'Pelaksana tidak ditemukan di swimlane ini',
} as const;

// ==================== LAMPIRAN MESSAGES ====================
export const LampiranMessages = {
  // Success
  LAMPIRAN_FOUND: 'Lampiran ditemukan',
  LAMPIRAN_ADDED: 'Lampiran berhasil ditambahkan',
  LAMPIRAN_UPDATED: 'Lampiran berhasil diperbarui',
  LAMPIRAN_DELETED: 'Lampiran berhasil dihapus',

  // Error
  DETAIL_SOP_NOT_FOUND: 'Detail SOP tidak ditemukan',
  PERATURAN_EXISTS: 'Peraturan sudah terdaftar sebagai dasar hukum',
  PERATURAN_NOT_FOUND: 'Peraturan tidak ditemukan',
  PERATURAN_DICABUT: 'Peraturan berstatus DICABUT tidak dapat dijadikan dasar hukum',
  PERATURAN_DIFFERENT_OPD: 'Peraturan harus berasal dari OPD yang sama dengan SOP',
  PERATURAN_AS_DASAR_HUKUM: 'Peraturan tidak dapat dihapus karena masih digunakan sebagai dasar hukum SOP',
  SOP_SELF_REFERENCE: 'SOP tidak boleh terkait dengan dirinya sendiri',
  SOP_RELATIONSHIP_EXISTS: 'Relasi SOP terkait sudah ada',
  SOP_BIDIRECTIONAL_DUPLICATE: 'Relasi terbalik (B→A) sudah ada — tidak boleh menduplikasi',
} as const;

// ==================== TIM MESSAGES ====================
export const TimMessages = {
  // Success
  TIM_CREATED: 'Anggota tim berhasil ditambahkan',
  TIM_UPDATED: 'Anggota tim berhasil diperbarui',
  TIM_DELETED: 'Anggota tim berhasil dihapus',
  TIM_FOUND: 'Data tim ditemukan',
  
  // Error
  TIM_NOT_FOUND: 'Anggota Tim tidak ditemukan',
  TIM_ALREADY_INACTIVE: 'Anggota sudah berstatus NONAKTIF',
  TIM_CANNOT_CHANGE_KOORDINATOR: 'Tidak dapat mengubah koordinator karena akan menyebabkan kekosongan koordinator',
  TIM_SAME_OPD: 'OPD tujuan sama dengan OPD saat ini',
  TIM_ALREADY_EXISTS: '{peran} untuk OPD ini sudah ada',
} as const;

// ==================== TIM EVALUASI MESSAGES ====================
export const TimEvaluasiMessages = {
  // Success
  TIM_EVALUASI_CREATED: 'Tim Evaluasi SOP berhasil dibentuk',
  TIM_EVALUASI_FOUND: 'Data Tim Evaluasi ditemukan',
  
  // Error
  TIM_EVALUASI_EXISTS: 'Tim Evaluasi SOP sudah dibentuk sebelumnya',
  TIM_EVALUASI_NOT_FOUND: 'Tim Evaluasi tidak ditemukan',
} as const;

// ==================== PERATURAN MESSAGES ====================
export const PeraturanMessages = {
  // Success
  PERATURAN_CREATED: 'Peraturan berhasil dibuat',
  PERATURAN_UPDATED: 'Peraturan berhasil diperbarui',
  PERATURAN_DELETED: 'Peraturan berhasil dihapus',
  PERATURAN_FOUND: 'Data peraturan ditemukan',

  // Error
  PERATURAN_NOT_FOUND: 'Peraturan tidak ditemukan',
  PERATURAN_NAME_EXISTS: 'Nama peraturan sudah terdaftar',
  PERATURAN_DICABUT: 'Peraturan yang sudah dicabut tidak dapat diubah',
  PERATURAN_ALREADY_REVOKED: 'Peraturan sudah berstatus DICABUT',
} as const;

// ==================== EVALUASI MESSAGES ====================
export const EvaluasiMessages = {
  // Success
  EVALUASI_CREATED: 'Pengajuan evaluasi berhasil dibuat',
  EVALUASI_UPDATED: 'Pengajuan evaluasi berhasil diperbarui',
  EVALUASI_FOUND: 'Data pengajuan evaluasi ditemukan',
  NILAI_ADDED: 'Nilai evaluasi berhasil ditambahkan',
  EVALUASI_SELESAI: 'Evaluasi berhasil diselesaikan',

  // Error
  EVALUASI_NOT_FOUND: 'Pengajuan evaluasi tidak ditemukan',
  EVALUASI_ALREADY_EXISTS: 'OPD ini sudah memiliki pengajuan evaluasi aktif',
  SOP_DETAIL_NOT_FOUND: 'Detail SOP tidak ditemukan',
  INVALID_STATUS: 'Tidak dapat melakukan aksi — status pengajuan: {status}',
  ALL_SOP_MUST_BE_EVALUATED: 'Semua DetailSOP harus sudah dinilai sebelum evaluasi dapat diselesaikan',
  EVALUASI_TERJADWAL_REQUIRES_NILAI_OPD: 'Evaluasi TERJADWAL wajib mengisi nilaiOPD sebelum diselesaikan',
  EVALUASI_MANDIRI_CANNOT_HAVE_NILAI_OPD: 'Evaluasi MANDIRI tidak boleh memiliki nilaiOPD',
} as const;

// ==================== HEALTH MESSAGES ====================
export const HealthMessages = {
  // Success
  HEALTH_OK: 'Service is healthy',
  HEALTH_READY: 'Service is ready',
  
  // Error
  HEALTH_ERROR: 'Service is unhealthy',
  HEALTH_NOT_READY: 'Service is not ready',
} as const;

// ==================== GENERIC MESSAGES ====================
export const GenericMessages = {
  // Success
  SUCCESS: 'Berhasil',
  CREATED: 'Berhasil dibuat',
  UPDATED: 'Berhasil diperbarui',
  DELETED: 'Berhasil dihapus',
  FOUND: 'Data ditemukan',
  OK: 'OK',
  
  // Error
  NOT_FOUND: 'Data tidak ditemukan',
  CONFLICT: 'Data sudah ada',
  FORBIDDEN: 'Akses ditolak',
  UNAUTHORIZED: 'Tidak terautentikasi',
  BAD_REQUEST: 'Permintaan tidak valid',
  INTERNAL_ERROR: 'Terjadi kesalahan pada server',
  VALIDATION_FAILED: 'Validasi gagal',
} as const;
