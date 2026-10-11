import React, { useState } from "react";
import { ApiKeyItem } from "../types";
import { formatDate, formatDateTime, formatRelativeTime } from "../utils/formatters";
import { StatusBadge } from "./StatusBadge";
import { EnvironmentBadge } from "./EnvironmentBadge";
import {
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Clock,
  X,
  Edit2,
  Trash2,
} from "lucide-react";

interface KeyDetailsModalProps {
  item: ApiKeyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: ApiKeyItem) => void;
  onDelete: (id: number, appName: string) => void;
  onTouch: (id: number) => void;
  onCopyKey: (keyText: string, appName: string) => void;
}

const getSnippetForTab = (item: ApiKeyItem, tab: "bearer" | "header" | "curl" | "python" | "env"): string => {
  const key = item.key_value;
  switch (tab) {
    case "bearer":
      return `Authorization: Bearer ${key}`;
    case "header":
      return `X-API-Key: ${key}`;
    case "curl":
      return `curl -X GET "${item.portal_url || "https://api.homelab.local/v1/resource"}" \\\n  -H "Authorization: Bearer ${key}" \\\n  -H "Content-Type: application/json"`;
    case "python":
      return `import requests\n\nheaders = {\n    "Authorization": f"Bearer ${key}",\n    "Accept": "application/json"\n}\nresponse = requests.get("${item.portal_url || "https://api.homelab.local/v1/resource"}", headers=headers)\nprint(response.json())`;
    case "env":
      return `# ${item.app_name} (${item.environment || "Homelab"})\n${item.app_name.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_API_KEY="${key}"`;
  }
};

const maskIdentifier = (value: string | null | undefined): string => {
  if (!value) return "";
  const suffix = value.length > 4 ? value.slice(-4) : "";
  return "••••••••••••" + suffix;
};

interface SecretDisplayFieldProps {
  label: string;
  value: string;
  isRevealed: boolean;
  onToggleReveal: () => void;
  onCopy: () => void;
  toggleButtonId: string;
  copyButtonId: string;
}

const SecretDisplayField: React.FC<SecretDisplayFieldProps> = ({
  label,
  value,
  isRevealed,
  onToggleReveal,
  onCopy,
  toggleButtonId,
  copyButtonId,
}) => {
  const maskedVal = maskIdentifier(value);
  const displayText = isRevealed ? value : maskedVal;

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] block">
        {label}
      </span>
      <div className="p-2.5 rounded-xl bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-[#3f3f46] flex items-center justify-between gap-2">
        <span
          className={`font-mono text-xs select-all break-all ${
            isRevealed ? "text-[#09090b] dark:text-[#f4f4f5] font-semibold" : "text-[#52525b] dark:text-[#d4d4d8]"
          }`}
        >
          {displayText}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            id={toggleButtonId}
            onClick={onToggleReveal}
            className="p-1 rounded-lg text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] transition-colors cursor-pointer"
            title={isRevealed ? `Hide ${label}` : `Reveal ${label}`}
          >
            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            id={copyButtonId}
            onClick={onCopy}
            className="p-1.5 rounded-lg bg-[#09090b] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:text-[#09090b] text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            title={`Copy ${label}`}
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface SnippetViewerProps {
  item: ApiKeyItem;
}

const SnippetViewer: React.FC<SnippetViewerProps> = ({ item }) => {
  const [codeTab, setCodeTab] = useState<"bearer" | "header" | "curl" | "python" | "env">("bearer");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const snippet = getSnippetForTab(item, codeTab);

  const handleCopy = () => {
    void navigator.clipboard.writeText(snippet);
    setCopiedSnippet(codeTab);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
          Integration Snippets
        </span>
        <div className="flex items-center gap-1">
          {(["bearer", "header", "curl", "python", "env"] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setCodeTab(tab)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                codeTab === tab
                  ? "bg-[#09090b] text-white dark:bg-[#f4f4f5] dark:text-[#09090b]"
                  : "text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5]"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="relative group">
        <pre className="p-3.5 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto border border-zinc-800 leading-relaxed">
          {snippet}
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] flex items-center gap-1 border border-zinc-700 transition-colors cursor-pointer"
        >
          {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copiedSnippet ? "Copied" : "Copy Snippet"}</span>
        </button>
      </div>
    </div>
  );
};

interface KeyDetailsAttributesProps {
  item: ApiKeyItem;
  onTouch: (id: number) => void;
}

const KeyDetailsAttributes: React.FC<KeyDetailsAttributesProps> = ({ item, onTouch }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
      {item.provider && (
        <div className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5]/60 dark:bg-[#27272a]/50 sm:col-span-2">
          <span className="text-[10px] uppercase font-bold text-[#71717a] dark:text-[#a1a1aa] block mb-0.5">
            API Provider
          </span>
          <span className="text-sm font-semibold text-[#09090b] dark:text-[#f4f4f5]">
            {item.provider}
          </span>
        </div>
      )}

      <div className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5]/60 dark:bg-[#27272a]/50">
        <span className="text-[10px] uppercase font-bold text-[#71717a] dark:text-[#a1a1aa] block mb-0.5">
          App / Service / Project
        </span>
        <span className="text-sm font-medium text-[#09090b] dark:text-[#f4f4f5]">
          {item.project || "—"}
        </span>
      </div>

      <div className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5]/60 dark:bg-[#27272a]/50">
        <span className="text-[10px] uppercase font-bold text-[#71717a] dark:text-[#a1a1aa] block mb-0.5">
          Account / Owner
        </span>
        <span className="text-sm font-mono text-[#52525b] dark:text-[#a1a1aa]">
          {item.account || "—"}
        </span>
      </div>

      <div className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5]/60 dark:bg-[#27272a]/50">
        <span className="text-[10px] uppercase font-bold text-[#71717a] dark:text-[#a1a1aa] block mb-0.5">
          Expiry Date
        </span>
        <span className="text-sm text-[#52525b] dark:text-[#a1a1aa]">
          {item.expiry_date ? formatDateTime(item.expiry_date) : "No Expiration"}
        </span>
      </div>

      <div className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5]/60 dark:bg-[#27272a]/50 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#71717a] dark:text-[#a1a1aa] block mb-0.5">
            Last Used Date
          </span>
          <span className="text-sm text-[#52525b] dark:text-[#a1a1aa]">
            {formatRelativeTime(item.last_used_date)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onTouch(item.id)}
          className="px-2 py-1 text-[11px] font-medium rounded-lg bg-[#e4e4e7] dark:bg-[#3f3f46] hover:bg-zinc-300 dark:hover:bg-zinc-600 hover:text-[#09090b] dark:hover:text-[#f4f4f5] text-[#52525b] dark:text-[#a1a1aa] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Clock className="w-3 h-3" />
          Touch Now
        </button>
      </div>

      <div className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5]/60 dark:bg-[#27272a]/50 sm:col-span-2">
        <span className="text-[10px] uppercase font-bold text-[#71717a] dark:text-[#a1a1aa] block mb-0.5">
          IP Restrictions / CIDR
        </span>
        <span className="text-xs font-mono text-[#52525b] dark:text-[#a1a1aa]">
          {item.ip_restrictions || "No restrictions configured (any IP allowed)"}
        </span>
      </div>

      {item.portal_url && (
        <div className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5]/60 dark:bg-[#27272a]/50 sm:col-span-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#71717a] dark:text-[#a1a1aa] block mb-0.5">
              Management Portal
            </span>
            <span className="text-xs text-[#52525b] dark:text-[#a1a1aa] truncate block max-w-md">
              {item.portal_url}
            </span>
          </div>
          <a
            href={item.portal_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[#09090b] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:text-[#09090b] dark:hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <span>Open Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {item.creator_contact && (
        <div className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5]/60 dark:bg-[#27272a]/50 sm:col-span-2">
          <span className="text-[10px] uppercase font-bold text-[#71717a] dark:text-[#a1a1aa] block mb-0.5">
            Creator / Contact
          </span>
          <span className="text-xs text-[#52525b] dark:text-[#a1a1aa]">
            {item.creator_contact}
          </span>
        </div>
      )}

      {item.purpose && (
        <div className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5]/60 dark:bg-[#27272a]/50 sm:col-span-2">
          <span className="text-[10px] uppercase font-bold text-[#71717a] dark:text-[#a1a1aa] block mb-0.5">
            Purpose & Integration Notes
          </span>
          <p className="text-xs text-[#52525b] dark:text-[#a1a1aa] whitespace-pre-wrap leading-relaxed">
            {item.purpose}
          </p>
        </div>
      )}
    </div>
  );
};

export const KeyDetailsModal: React.FC<KeyDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onTouch,
  onCopyKey,
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const [showOrgId, setShowOrgId] = useState(false);
  const [showClientId, setShowClientId] = useState(false);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="key-details-modal"
        className="bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e4e4e7] dark:border-[#27272a] flex items-center justify-between bg-[#f4f4f5] dark:bg-[#27272a]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-[#09090b] dark:text-[#f4f4f5] border border-[#e4e4e7] dark:border-[#3f3f46]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#09090b] dark:text-[#f4f4f5]">
                  {item.app_name}
                </h2>
                <span className="text-xs text-[#71717a] dark:text-[#a1a1aa] font-mono">#{item.id}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <EnvironmentBadge environment={item.environment} size="sm" />
                <StatusBadge item={item} size="sm" />
              </div>
            </div>
          </div>
          <button
            type="button"
            id="close-key-details-btn"
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] rounded-lg hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Secret Key Display Box */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] block">
              Key Value / Secret
            </span>
            <div className="p-3 rounded-xl bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-[#3f3f46] flex items-center justify-between gap-3">
              <span
                className={`font-mono text-xs select-all break-all ${
                  showSecret ? "text-[#09090b] dark:text-[#f4f4f5] font-semibold" : "text-[#52525b] dark:text-[#d4d4d8]"
                }`}
              >
                {showSecret ? item.key_value : "••••••••••••••••••••••••••••••••" + item.key_value.slice(-4)}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  id="details-toggle-eye"
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-1.5 rounded-lg text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] transition-colors cursor-pointer"
                  title={showSecret ? "Hide secret" : "Reveal secret"}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  id="details-copy-key"
                  onClick={() => onCopyKey(item.key_value, item.app_name)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#09090b] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:text-[#09090b] dark:hover:bg-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>

          {/* Org ID & Client ID if present */}
          {(item.org_id || item.client_id) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {item.org_id && (
                <SecretDisplayField
                  label="Organization ID"
                  value={item.org_id}
                  isRevealed={showOrgId}
                  onToggleReveal={() => setShowOrgId(!showOrgId)}
                  onCopy={() => onCopyKey(item.org_id!, `${item.app_name} (Org ID)`)}
                  toggleButtonId="details-toggle-org-eye"
                  copyButtonId="details-copy-org"
                />
              )}

              {item.client_id && (
                <SecretDisplayField
                  label="Client ID"
                  value={item.client_id}
                  isRevealed={showClientId}
                  onToggleReveal={() => setShowClientId(!showClientId)}
                  onCopy={() => onCopyKey(item.client_id!, `${item.app_name} (Client ID)`)}
                  toggleButtonId="details-toggle-client-eye"
                  copyButtonId="details-copy-client"
                />
              )}
            </div>
          )}

          {/* Quick Integration Code Snippets */}
          <SnippetViewer item={item} />

          {/* Key Attributes Grid */}
          <KeyDetailsAttributes item={item} onTouch={onTouch} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] flex items-center justify-between">
          <span className="text-xs text-[#71717a] dark:text-[#a1a1aa]">
            Created {formatDate(item.created_date)}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="details-delete-btn"
              onClick={() => {
                onClose();
                onDelete(item.id, item.app_name);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              type="button"
              id="details-edit-btn"
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="px-4 py-1.5 rounded-xl bg-[#09090b] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:text-[#09090b] dark:hover:bg-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Key</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
