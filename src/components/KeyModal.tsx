import React, { useState, useEffect } from "react";
import { ApiKeyItem, FieldVisibilitySettings, OptionalFieldKey } from "../types";
import { FIELD_CONFIGS } from "../constants/fieldConfig";
import { generateRandomKey } from "../utils/formatters";
import { generateSecret } from "../utils/secretGenerator";
import {
  KeyRound,
  Eye,
  EyeOff,
  Wand2,
  Calendar,
  Layers,
  Shield,
  Clock,
  Sparkles,
  X,
  Plus,
  Save,
  SlidersHorizontal,
} from "lucide-react";

interface KeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ApiKeyItem>) => Promise<void>;
  initialKey?: ApiKeyItem | null;
  visibility: FieldVisibilitySettings;
  onOpenSettings: () => void;
  onOpenSecretGenerator?: () => void;
}

export const KeyModal: React.FC<KeyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialKey,
  visibility,
  onOpenSettings,
  onOpenSecretGenerator,
}) => {
  const [formData, setFormData] = useState<Partial<ApiKeyItem>>({
    app_name: "",
    key_value: "",
    org_id: "",
    client_id: "",
    created_date: new Date().toISOString().slice(0, 10),
    expiry_date: "",
    account: "",
    project: "",
    environment: "Homelab",
    last_used_date: "",
    status: "Active",
    ip_restrictions: "",
    portal_url: "",
    creator_contact: "",
    purpose: "",
  });

  const [showSecret, setShowSecret] = useState(false);
  const [showOrgId, setShowOrgId] = useState(false);
  const [showClientId, setShowClientId] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialKey) {
      setFormData({
        app_name: initialKey.app_name || "",
        key_value: initialKey.key_value || "",
        org_id: initialKey.org_id || "",
        client_id: initialKey.client_id || "",
        created_date: initialKey.created_date ? initialKey.created_date.slice(0, 10) : "",
        expiry_date: initialKey.expiry_date ? initialKey.expiry_date.slice(0, 10) : "",
        account: initialKey.account || "",
        project: initialKey.project || "",
        environment: initialKey.environment || "Homelab",
        last_used_date: initialKey.last_used_date ? initialKey.last_used_date.slice(0, 10) : "",
        status: initialKey.status || "Active",
        ip_restrictions: initialKey.ip_restrictions || "",
        portal_url: initialKey.portal_url || "",
        creator_contact: initialKey.creator_contact || "",
        purpose: initialKey.purpose || "",
      });
    } else {
      setFormData({
        app_name: "",
        key_value: "",
        org_id: "",
        client_id: "",
        created_date: new Date().toISOString().slice(0, 10),
        expiry_date: "",
        account: "",
        project: "",
        environment: "Homelab",
        last_used_date: "",
        status: "Active",
        ip_restrictions: "",
        portal_url: "",
        creator_contact: "",
        purpose: "",
      });
    }
    setError(null);
    setShowSecret(false);
    setShowOrgId(false);
    setShowClientId(false);
  }, [initialKey, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ApiKeyItem, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleGenerate = (type: "homelab_sk" | "bearer64" | "hex32" | "uuid") => {
    const key = generateRandomKey(type);
    setFormData((prev) => ({ ...prev, key_value: key }));
    setShowSecret(true);
  };

  const setExpiryDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFormData((prev) => ({ ...prev, expiry_date: d.toISOString().slice(0, 10) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.app_name?.trim()) {
      setError("App Name is required");
      return;
    }
    if (!formData.key_value?.trim()) {
      setError("Key Value is required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save key");
    } finally {
      setLoading(false);
    }
  };

  const hiddenOptionalCount = FIELD_CONFIGS.filter((f) => !visibility[f.key]).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="key-modal"
        className="bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e4e4e7] dark:border-[#27272a] flex items-center justify-between bg-[#f4f4f5] dark:bg-[#27272a]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-[#09090b] dark:text-[#f4f4f5] border border-[#e4e4e7] dark:border-[#3f3f46]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#09090b] dark:text-[#f4f4f5]">
                {initialKey ? "Edit API Key" : "Register New API Key"}
              </h2>
              <p className="text-xs text-[#71717a] dark:text-[#a1a1aa]">
                {initialKey
                  ? `Updating token for ${initialKey.app_name}`
                  : "Store and manage an API key in your SQLite homelab registry"}
              </p>
            </div>
          </div>
          <button
            id="close-key-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] rounded-lg hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* REQUIRED FIELDS (Always visible) */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] mb-1.5">
                App / Service Name <span className="text-red-500">*</span>
              </label>
              <input
                id="input-app-name"
                type="text"
                required
                value={formData.app_name || ""}
                onChange={(e) => handleChange("app_name", e.target.value)}
                placeholder="e.g., Home Assistant Long-Lived Token, Proxmox VE API"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa]">
                  Key Value / Token <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] mr-0.5 hidden sm:inline">Quick:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sec = generateSecret({ length: 24, format: "alphanumeric" });
                      setFormData((p) => ({ ...p, key_value: sec }));
                      setShowSecret(true);
                    }}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#f4f4f5] dark:bg-[#27272a] text-[#52525b] dark:text-[#a1a1aa] hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-[#09090b] dark:hover:text-[#f4f4f5] border border-[#e4e4e7] dark:border-[#3f3f46] transition-colors cursor-pointer"
                    title="Generate 24-char alphanumeric secret"
                  >
                    24-Alpha
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sec = generateSecret({ length: 36, format: "alphanumeric" });
                      setFormData((p) => ({ ...p, key_value: sec }));
                      setShowSecret(true);
                    }}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#f4f4f5] dark:bg-[#27272a] text-[#52525b] dark:text-[#a1a1aa] hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-[#09090b] dark:hover:text-[#f4f4f5] border border-[#e4e4e7] dark:border-[#3f3f46] transition-colors cursor-pointer"
                    title="Generate 36-char alphanumeric secret"
                  >
                    36-Alpha
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sec = generateSecret({ length: 48, format: "hex" });
                      setFormData((p) => ({ ...p, key_value: sec }));
                      setShowSecret(true);
                    }}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#f4f4f5] dark:bg-[#27272a] text-[#52525b] dark:text-[#a1a1aa] hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-[#09090b] dark:hover:text-[#f4f4f5] border border-[#e4e4e7] dark:border-[#3f3f46] transition-colors cursor-pointer"
                    title="Generate 48-char hex secret"
                  >
                    48-Hex
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sec = generateSecret({ length: 64, format: "alphanumeric" });
                      setFormData((p) => ({ ...p, key_value: sec }));
                      setShowSecret(true);
                    }}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#f4f4f5] dark:bg-[#27272a] text-[#52525b] dark:text-[#a1a1aa] hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-[#09090b] dark:hover:text-[#f4f4f5] border border-[#e4e4e7] dark:border-[#3f3f46] transition-colors cursor-pointer"
                    title="Generate 64-char alphanumeric secret"
                  >
                    64-Alpha
                  </button>
                  {onOpenSecretGenerator && (
                    <button
                      type="button"
                      onClick={onOpenSecretGenerator}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 border border-[#e4e4e7] dark:border-[#3f3f46] transition-colors flex items-center gap-1 cursor-pointer"
                      title="Open Full Secret Generator"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generator...</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  id="input-key-value"
                  type={showSecret ? "text" : "password"}
                  required
                  value={formData.key_value || ""}
                  onChange={(e) => handleChange("key_value", e.target.value)}
                  placeholder="Paste or generate your secret key or bearer token"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] transition-colors cursor-pointer"
                  title={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* DYNAMIC OPTIONAL FIELDS BASED ON VISIBILITY SETTINGS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#e4e4e7] dark:border-[#27272a]">
            {visibility.org_id && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa]">
                    Organization ID (Org ID)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowOrgId(!showOrgId)}
                    className="text-[11px] text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {showOrgId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showOrgId ? "Mask" : "Reveal"}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="input-org-id"
                    type={showOrgId ? "text" : "password"}
                    value={formData.org_id || ""}
                    onChange={(e) => handleChange("org_id", e.target.value)}
                    placeholder="e.g., org_89104fa2089b or org-prod-us1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 placeholder:font-sans"
                  />
                </div>
              </div>
            )}

            {visibility.client_id && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa]">
                    Client ID (App ID)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowClientId(!showClientId)}
                    className="text-[11px] text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {showClientId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showClientId ? "Mask" : "Reveal"}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="input-client-id"
                    type={showClientId ? "text" : "password"}
                    value={formData.client_id || ""}
                    onChange={(e) => handleChange("client_id", e.target.value)}
                    placeholder="e.g., client_4901bcf8910a or app_9018471b"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 placeholder:font-sans"
                  />
                </div>
              </div>
            )}

            {visibility.environment && (
              <div>
                <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] mb-1.5">
                  Environment
                </label>
                <select
                  id="input-environment"
                  value={formData.environment || "Homelab"}
                  onChange={(e) => handleChange("environment", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all"
                >
                  <option value="Homelab">Homelab</option>
                  <option value="Prod">Prod</option>
                  <option value="Dev">Dev</option>
                  <option value="Staging">Staging</option>
                  <option value="Testing">Testing</option>
                  <option value="DMZ">DMZ / Edge</option>
                </select>
              </div>
            )}

            {visibility.status && (
              <div>
                <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] mb-1.5">
                  Status
                </label>
                <select
                  id="input-status"
                  value={formData.status || "Active"}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Revoked">Revoked</option>
                </select>
              </div>
            )}

            {visibility.expiry_date && (
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa]">
                    Expiry Date
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] mr-1">Quick:</span>
                    <button
                      type="button"
                      onClick={() => setExpiryDays(30)}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#f4f4f5] dark:bg-[#27272a] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] text-[#52525b] dark:text-[#a1a1aa] transition-colors cursor-pointer"
                    >
                      +30d
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpiryDays(90)}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#f4f4f5] dark:bg-[#27272a] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] text-[#52525b] dark:text-[#a1a1aa] transition-colors cursor-pointer"
                    >
                      +90d
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpiryDays(365)}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#f4f4f5] dark:bg-[#27272a] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] text-[#52525b] dark:text-[#a1a1aa] transition-colors cursor-pointer"
                    >
                      +1 Year
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange("expiry_date", "")}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#f4f4f5] dark:bg-[#27272a] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] text-[#52525b] dark:text-[#a1a1aa] transition-colors cursor-pointer"
                    >
                      Never
                    </button>
                  </div>
                </div>
                <input
                  id="input-expiry-date"
                  type="date"
                  value={formData.expiry_date || ""}
                  onChange={(e) => handleChange("expiry_date", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all"
                />
              </div>
            )}

            {visibility.project && (
              <div>
                <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] mb-1.5">
                  Project / Service Stack
                </label>
                <input
                  id="input-project"
                  type="text"
                  value={formData.project || ""}
                  onChange={(e) => handleChange("project", e.target.value)}
                  placeholder="e.g., Media Stack, Observability, K3s"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all"
                />
              </div>
            )}

            {visibility.account && (
              <div>
                <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] mb-1.5">
                  Account / Linked Identity
                </label>
                <input
                  id="input-account"
                  type="text"
                  value={formData.account || ""}
                  onChange={(e) => handleChange("account", e.target.value)}
                  placeholder="e.g., root@pam, sysadmin@local"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all"
                />
              </div>
            )}

            {visibility.created_date && (
              <div>
                <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] mb-1.5">
                  Created Date
                </label>
                <input
                  id="input-created-date"
                  type="date"
                  value={formData.created_date || ""}
                  onChange={(e) => handleChange("created_date", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all"
                />
              </div>
            )}

            {visibility.last_used_date && (
              <div>
                <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] mb-1.5">
                  Last Used Date
                </label>
                <input
                  id="input-last-used-date"
                  type="date"
                  value={formData.last_used_date || ""}
                  onChange={(e) => handleChange("last_used_date", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all"
                />
              </div>
            )}

            {visibility.ip_restrictions && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] mb-1.5">
                  IP Restrictions / Allowed CIDR
                </label>
                <input
                  id="input-ip-restrictions"
                  type="text"
                  value={formData.ip_restrictions || ""}
                  onChange={(e) => handleChange("ip_restrictions", e.target.value)}
                  placeholder="e.g., 192.168.1.0/24, 100.64.0.0/10, Tailnet only"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all"
                />
              </div>
            )}

            {visibility.portal_url && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] mb-1.5">
                  Portal URL / Dashboard Link
                </label>
                <input
                  id="input-portal-url"
                  type="url"
                  value={formData.portal_url || ""}
                  onChange={(e) => handleChange("portal_url", e.target.value)}
                  placeholder="https://pve.internal:8006 or https://dash.cloudflare.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all"
                />
              </div>
            )}

            {visibility.creator_contact && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] mb-1.5">
                  Creator / Contact Info
                </label>
                <input
                  id="input-creator-contact"
                  type="text"
                  value={formData.creator_contact || ""}
                  onChange={(e) => handleChange("creator_contact", e.target.value)}
                  placeholder="admin@homelab.local or #devops"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all"
                />
              </div>
            )}

            {visibility.purpose && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] mb-1.5">
                  Purpose & Integration Notes
                </label>
                <textarea
                  id="input-purpose"
                  rows={2}
                  value={formData.purpose || ""}
                  onChange={(e) => handleChange("purpose", e.target.value)}
                  placeholder="Explain the scope, automation jobs, or service permissions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-500 transition-all"
                />
              </div>
            )}
          </div>

          {/* Hidden fields notice */}
          {hiddenOptionalCount > 0 && (
            <div className="p-3 rounded-xl bg-[#f4f4f5]/70 dark:bg-[#27272a]/70 border border-[#e4e4e7] dark:border-[#27272a] flex items-center justify-between text-xs text-[#71717a] dark:text-[#a1a1aa]">
              <span>
                {hiddenOptionalCount} optional field{hiddenOptionalCount > 1 ? "s are" : " is"} hidden by Display Settings.
              </span>
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-[#09090b] dark:text-[#f4f4f5] font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                Customize
              </button>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] flex items-center justify-end gap-2.5">
          <button
            type="button"
            id="cancel-key-modal-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#52525b] dark:text-[#a1a1aa] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="submit-key-modal-btn"
            disabled={loading}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-[#09090b] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:text-[#09090b] dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Saving...</span>
            ) : initialKey ? (
              <>
                <Save className="w-3.5 h-3.5" />
                Update Key
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Register Key
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
