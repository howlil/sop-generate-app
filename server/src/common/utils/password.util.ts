/**
 * Generate a cryptographically secure random password.
 * Uses crypto.getRandomValues instead of Math.random for better security.
 */
export function generateSecurePassword(length = 8): string {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const symbols = "!@#$%^&*";
  const all = lower + upper + digits + symbols;

  // Guarantee at least one of each type
  let password = "";
  password += lower[secureRandomInt(lower.length)];
  password += upper[secureRandomInt(upper.length)];
  password += digits[secureRandomInt(digits.length)];
  password += symbols[secureRandomInt(symbols.length)];

  // Fill remaining with random chars
  for (let i = password.length; i < length; i++) {
    password += all[secureRandomInt(all.length)];
  }

  // Shuffle using Fisher-Yates with crypto-secure random
  const chars = password.split("");
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

/**
 * Generate a cryptographically secure random integer in range [0, max)
 */
function secureRandomInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}
