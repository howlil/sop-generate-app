import { BadRequestException } from '@nestjs/common';

/**
 * Password strength validator
 * Enforces minimum security requirements for user passwords
 */
export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 100;

  static validate(password: string): void {
    const errors: string[] = [];

    if (!password || password.length === 0) {
      throw new BadRequestException('Kata sandi wajib diisi');
    }

    if (password.length < this.MIN_LENGTH) {
      errors.push(`Minimal ${this.MIN_LENGTH} karakter`);
    }

    if (password.length > this.MAX_LENGTH) {
      errors.push(`Maksimal ${this.MAX_LENGTH} karakter`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Harus mengandung minimal 1 huruf kapital');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Harus mengandung minimal 1 huruf kecil');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Harus mengandung minimal 1 angka');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push(
        'Harus mengandung minimal 1 karakter khusus (!@#$%^&*(),.?":{}|<>)',
      );
    }

    if (errors.length > 0) {
      throw new BadRequestException(
        `Kata sandi tidak valid: ${errors.join(', ')}`,
      );
    }
  }
}
