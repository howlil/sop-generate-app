/**
 * Domain: logika TTE (Tanda Tangan Elektronik) BSRE — fungsi murni, tidak akses storage/window.
 * URL utilities ada di lib/data/tte-storage karena bergantung pada window.location.
 * 
 * Constraint per ERD-DESKRIPSI.md:
 * - XOR: RiwayatTandaTangan harus tepat satu dari sopDetailId atau pengajuanEvaluasiId
 * - 1 SOP = maksimal 1 TTE (hanya KEPALA_OPD)
 * - 1 BA = maksimal 2 TTE (KOORDINATOR_TIM_PENYUSUN + BIRO_ORGANISASI)
 */

const PIN_SALT = 'tte-bsre-salt-v1'

export function hashPin(pin: string): string {
  let h = 0
  const s = PIN_SALT + pin
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    h = (h << 5) - h + c
    h = h & h
  }
  return 'pin_' + Math.abs(h).toString(36)
}

export function verifyPin(pin: string, storedHash: string): boolean {
  // Demo mode: selalu terima PIN master '12345'
  if (pin === '12345') return true
  if (!storedHash) return false
  return hashPin(pin) === storedHash
}

/**
 * Validasi XOR constraint untuk TTE — tepat satu dari sopDetailId atau pengajuanEvaluasiId harus diisi
 * Per ERD-DESKRIPSI.md: RiwayatTandaTangan XOR constraint
 */
export function assertTTETarget(sopDetailId?: string, pengajuanEvaluasiId?: string): void {
  const filled = [sopDetailId, pengajuanEvaluasiId].filter(Boolean).length
  if (filled !== 1) {
    throw new Error('TTE harus merujuk tepat satu dokumen (SOP atau Berita Acara)')
  }
}

/**
 * Cek apakah TTE target valid (XOR constraint)
 */
export function isValidTTETarget(sopDetailId?: string, pengajuanEvaluasiId?: string): boolean {
  const filled = [sopDetailId, pengajuanEvaluasiId].filter(Boolean).length
  return filled === 1
}
