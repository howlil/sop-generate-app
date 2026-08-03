import {
  maskWhatsappNumber,
  normalizeIndonesianWhatsappNumber,
  parseWhatsappRecipientAllowlist,
} from './whatsapp-phone.util';

describe('WhatsApp phone utilities', () => {
  it.each([
    ['081234567890', '6281234567890'],
    ['81234567890', '6281234567890'],
    ['+62 812-3456-7890', '6281234567890'],
    ['(62) 812.3456.7890', '6281234567890'],
  ])('menormalisasi %s', (input, expected) => {
    expect(normalizeIndonesianWhatsappNumber(input)).toBe(expected);
  });

  it.each([null, undefined, '', 'telepon', '0212345678', '62812#345', '0812'])(
    'menolak nomor tidak valid %s',
    (input) => {
      expect(normalizeIndonesianWhatsappNumber(input)).toBeNull();
    },
  );

  it('membuang allowlist invalid dan melakukan deduplikasi', () => {
    expect([...parseWhatsappRecipientAllowlist('081234567890,invalid,+62 812-3456-7890')]).toEqual([
      '6281234567890',
    ]);
  });

  it('menyamarkan nomor pada log', () => {
    expect(maskWhatsappNumber('6281234567890')).toBe('62812*****890');
    expect(maskWhatsappNumber('123')).toBe('***');
  });
});
