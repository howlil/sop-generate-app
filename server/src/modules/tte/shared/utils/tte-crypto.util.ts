import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

/**
 * Derives a key from the PIN. Since PIN is short, we use scrypt with a salt.
 */
function deriveKey(pin: string, salt: Buffer): Buffer {
  return crypto.scryptSync(pin, salt, KEY_LENGTH);
}

/**
 * Encrypts a passphrase using the user's PIN.
 * Returns a string formatted as: hex(salt):hex(iv):hex(encrypted):hex(authTag)
 */
export function encryptP12Passphrase(passphrase: string, pin: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(pin, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(passphrase, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
}

/**
 * Decrypts a passphrase using the user's PIN.
 */
export function decryptP12Passphrase(encryptedData: string, pin: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format');
  }

  const salt = Buffer.from(parts[0], 'hex');
  const iv = Buffer.from(parts[1], 'hex');
  const encrypted = Buffer.from(parts[2], 'hex');
  const tag = Buffer.from(parts[3], 'hex');

  const key = deriveKey(pin, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
