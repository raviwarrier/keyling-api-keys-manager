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

const CHARSET_MAP: Record<SecretFormat, string> = {
  alphanumeric: CHARSET_ALPHA_NUMERIC,
  hex: CHARSET_HEX_LOWER,
  "hex-upper": CHARSET_HEX_UPPER,
  "alphanumeric-symbols": CHARSET_SYMBOLS,
  "url-safe": CHARSET_URL_SAFE,
  uuid: CHARSET_HEX_LOWER,
  "homelab-prefixed": CHARSET_ALPHA_NUMERIC,
};

const POOL_SIZE_MAP: Record<SecretFormat, number> = {
  alphanumeric: 62,
  hex: 16,
  "hex-upper": 16,
  "alphanumeric-symbols": 82,
  "url-safe": 64,
  uuid: 16,
  "homelab-prefixed": 62,
};

function generateUuid(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback manual UUID v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.trunc(crypto.getRandomValues(new Uint8Array(1))[0] % 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getPrefix(format: SecretFormat, prefix?: string): string {
  if (prefix !== undefined && prefix !== "") {
    return prefix;
  }
  return format === "homelab-prefixed" ? "hl_live_" : "";
}

function getRandomChars(charset: string, targetLen: number): string {
  const charsetLen = charset.length;
  const maxValidByte = 256 - (256 % charsetLen);
  const randomBytes = new Uint8Array(targetLen * 2);
  crypto.getRandomValues(randomBytes);

  let result = "";
  let byteIndex = 0;

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
  return result;
}

function insertHyphens(str: string): string {
  if (str.length < 16) {
    return str;
  }
  const chunkSize = str.length % 8 === 0 ? 8 : 6;
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.slice(i, i + chunkSize));
  }
  return chunks.join("-");
}

/**
 * Generate a cryptographically secure random secret string using window.crypto
 */
export function generateSecret(options: SecretGeneratorOptions): string {
  const { length, format, prefix, includeHyphens } = options;

  if (format === "uuid") {
    return generateUuid();
  }

  const actualPrefix = getPrefix(format, prefix);
  const targetLen = Math.max(8, length - actualPrefix.length);
  const charset = CHARSET_MAP[format] || CHARSET_ALPHA_NUMERIC;
  let result = getRandomChars(charset, targetLen);

  if (includeHyphens) {
    result = insertHyphens(result);
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
  const poolSize = POOL_SIZE_MAP[format] || 62;
  const cleanLength = secret.replace(/[^a-zA-Z0-9!@#$%^&*()_=+[\\]{}|-]/g, "").length;
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
