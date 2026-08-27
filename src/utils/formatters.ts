import { ApiKeyItem } from "../types";

export function maskKey(key: string, visible: boolean = false): string {
  if (!key) return "";
  if (visible) return key;

  if (key.length <= 8) {
    return "••••••••";
  }

  // Check for common prefix patterns separated by underscore, hyphen, or colon
  const prefixMatch = key.match(/^([a-zA-Z0-9_\-]+[_\-:])(.+)$/);
  if (prefixMatch && prefixMatch[1].length <= 16 && prefixMatch[2].length > 6) {
    const prefix = prefixMatch[1];
    const rest = prefixMatch[2];
    const last4 = rest.slice(-4);
    return `${prefix}••••••••${last4}`;
  }

  const first4 = key.slice(0, 4);
  const last4 = key.slice(-4);
  return `${first4}••••••••${last4}`;
}

export interface KeyStatusEvaluation {
  badgeVariant: "active" | "expiring" | "expired" | "revoked" | "paused";
  label: string;
  subtext?: string;
  daysRemaining?: number;
}

export function evaluateKeyStatus(key: ApiKeyItem): KeyStatusEvaluation {
  const status = key.status || "Active";

  if (status === "Revoked") {
    return {
      badgeVariant: "revoked",
      label: "Revoked",
      subtext: "Token invalidated",
    };
  }

  if (status === "Paused") {
    return {
      badgeVariant: "paused",
      label: "Paused",
      subtext: "Temporarily disabled",
    };
  }

  // Check expiration if date exists
  if (key.expiry_date) {
    const expDate = new Date(key.expiry_date);
    if (!isNaN(expDate.getTime())) {
      const now = new Date();
      const diffMs = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        return {
          badgeVariant: "expired",
          label: "Expired",
          subtext: `Expired ${Math.abs(diffDays)}d ago`,
          daysRemaining: diffDays,
        };
      }

      if (diffDays <= 7) {
        return {
          badgeVariant: "expiring",
          label: diffDays === 1 ? "Expiring tomorrow" : `Expiring in ${diffDays}d`,
          subtext: `Action required`,
          daysRemaining: diffDays,
        };
      }

      return {
        badgeVariant: "active",
        label: "Active",
        subtext: `Expires in ${diffDays}d`,
        daysRemaining: diffDays,
      };
    }
  }

  return {
    badgeVariant: "active",
    label: "Active",
    subtext: "No expiration",
  };
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })} ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "Never";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  } catch {
    return dateString;
  }
}

export function generateRandomKey(type: "hex32" | "bearer64" | "homelab_sk" | "uuid"): string {
  if (type === "uuid") {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  if (type === "homelab_sk") {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "hl_sec_";
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  if (type === "bearer64") {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
    let token = "sk-live-";
    for (let i = 0; i < 40; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // hex32
  const chars = "0123456789abcdef";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
