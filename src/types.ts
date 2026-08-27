export interface ApiKeyItem {
  id: number;
  app_name: string;
  key_value: string;
  org_id?: string | null;
  client_id?: string | null;
  created_date?: string | null;
  expiry_date?: string | null;
  account?: string | null;
  project?: string | null;
  environment?: string | null;
  last_used_date?: string | null;
  status: 'Active' | 'Revoked' | 'Paused' | string;
  ip_restrictions?: string | null;
  portal_url?: string | null;
  creator_contact?: string | null;
  purpose?: string | null;
}

export type OptionalFieldKey =
  | 'org_id'
  | 'client_id'
  | 'created_date'
  | 'expiry_date'
  | 'account'
  | 'project'
  | 'environment'
  | 'last_used_date'
  | 'status'
  | 'ip_restrictions'
  | 'portal_url'
  | 'creator_contact'
  | 'purpose';

export interface FieldConfig {
  key: OptionalFieldKey;
  label: string;
  description: string;
  category: 'General' | 'Security & Access' | 'Dates & Lifecycle' | 'Contact & Notes';
  placeholder?: string;
  type: 'text' | 'date' | 'url' | 'select' | 'textarea';
  options?: string[];
}

export interface FieldVisibilitySettings {
  org_id: boolean;
  client_id: boolean;
  created_date: boolean;
  expiry_date: boolean;
  account: boolean;
  project: boolean;
  environment: boolean;
  last_used_date: boolean;
  status: boolean;
  ip_restrictions: boolean;
  portal_url: boolean;
  creator_contact: boolean;
  purpose: boolean;
}

export interface AppStats {
  total: number;
  active: number;
  expiringSoon: number;
  revokedOrExpired: number;
  paused: number;
  byEnvironment: Record<string, number>;
}
