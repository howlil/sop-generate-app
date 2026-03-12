/**
 * Domain: logika TTE (Tanda Tangan Elektronik) BSRE — fungsi murni, tidak akses storage/window.
 * URL utilities ada di lib/data/tte-storage karena bergantung pada window.location.
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
  return hashPin(pin) === storedHash
}
