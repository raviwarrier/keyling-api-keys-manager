/**
 * Cryptographically secure secret generator for Homelab API Keys
 */

export type SecretFormat =
  | "alphanumeric"
  | "hex"
  | "hex-upper"
  | "alphanumeric-symbols"
  | "url-safe"
  | "uuid"
  | "homelab-prefixed";

export interface SecretGeneratorOptions {
  length: number; // 24, 36, 48, 64, or custom
  format: SecretFormat;
  prefix?: string;
  includeHyphens?: boolean;
}

const CHARSET_ALPHA_NUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const CHARSET_HEX_LOWER = "0123456789abcdef";
const CHARSET_HEX_UPPER = "0123456789ABCDEF";
const CHARSET_SYMBOLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|";
const CHARSET_URL_SAFE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/**
 * Generate a cryptographically secure random secret string using window.crypto
 */
export function generateSecret(options: SecretGeneratorOptions): string {
  const { length, format, prefix, includeHyphens } = options;

  if (format === "uuid") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    // Fallback manual UUID v4
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  let charset = CHARSET_ALPHA_NUMERIC;
  if (format === "hex") charset = CHARSET_HEX_LOWER;
  else if (format === "hex-upper") charset = CHARSET_HEX_UPPER;
  else if (format === "alphanumeric-symbols") charset = CHARSET_SYMBOLS;
  else if (format === "url-safe") charset = CHARSET_URL_SAFE;
  else if (format === "homelab-prefixed") charset = CHARSET_ALPHA_NUMERIC;

  // Calculate required character count (accounting for prefix if any)
  const actualPrefix = format === "homelab-prefixed" ? (prefix || "hl_live_") : (prefix || "");
  const targetLen = Math.max(8, length - actualPrefix.length);

  const charsetLen = charset.length;
  // Use crypto.getRandomValues with rejection sampling to avoid modulo bias
  const randomBytes = new Uint8Array(targetLen * 2);
  crypto.getRandomValues(randomBytes);

  let result = "";
  let byteIndex = 0;

  const maxValidByte = 256 - (256 % charsetLen);

  while (result.length < targetLen) {
    if (byteIndex >= randomBytes.length) {
      crypto.getRandomValues(randomBytes);
      byteIndex = 0;
    }
    const byte = randomBytes[byteIndex++];
    if (byte < maxValidByte) {
      result += charset[byte % charsetLen];
    }
  }

  if (includeHyphens && result.length >= 16) {
    // Chunk every 4 or 8 characters
    const chunkSize = result.length % 8 === 0 ? 8 : 6;
    const chunks: string[] = [];
    for (let i = 0; i < result.length; i += chunkSize) {
      chunks.push(result.slice(i, i + chunkSize));
    }
    result = chunks.join("-");
  }

  return actualPrefix + result;
}

/**
 * Calculate entropy in bits and provide security strength analysis
 */
export function calculateEntropy(secret: string, format: SecretFormat): {
  bits: number;
  strength: "Weak" | "Moderate" | "Strong" | "Very Strong";
  crackTimeEstimate: string;
} {
  let poolSize = 62;
  if (format === "hex" || format === "hex-upper") poolSize = 16;
  else if (format === "alphanumeric-symbols") poolSize = 82;
  else if (format === "url-safe") poolSize = 64;
  else if (format === "uuid") poolSize = 16;

  const cleanLength = secret.replace(/[^a-zA-Z0-9!@#$%^&*()-_=+[\]{}|]/g, "").length;
  const bits = Math.round(cleanLength * Math.log2(poolSize));

  let strength: "Weak" | "Moderate" | "Strong" | "Very Strong" = "Weak";
  let crackTimeEstimate = "Instant";

  if (bits < 60) {
    strength = "Weak";
    crackTimeEstimate = "< a few minutes";
  } else if (bits < 90) {
    strength = "Moderate";
    crackTimeEstimate = "~ several centuries";
  } else if (bits < 128) {
    strength = "Strong";
    crackTimeEstimate = "billions of years";
  } else {
    strength = "Very Strong";
    crackTimeEstimate = "trillions of centuries (unbreakable)";
  }

  return { bits, strength, crackTimeEstimate };
}
