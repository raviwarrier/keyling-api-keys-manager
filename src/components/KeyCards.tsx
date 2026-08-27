import React, { useState } from "react";
import { ApiKeyItem, FieldVisibilitySettings } from "../types";
import { maskKey, formatDate, formatRelativeTime } from "../utils/formatters";
import { StatusBadge } from "./StatusBadge";
import { EnvironmentBadge } from "./EnvironmentBadge";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  CopyPlus,
  Clock,
  Info,
  Calendar,
  Layers,
  User,
  Shield,
  FileText,
} from "lucide-react";

interface KeyCardsProps {
  keys: ApiKeyItem[];
  visibility: FieldVisibilitySettings;
  revealedKeys: Record<number, boolean>;
  onToggleReveal: (id: number) => void;
  onCopyKey: (keyText: string, appName: string) => void;
  onEdit: (item: ApiKeyItem) => void;
  onDelete: (id: number, appName: string) => void;
  onClone: (id: number) => void;
  onTouch: (id: number) => void;
  onViewDetails: (item: ApiKeyItem) => void;
  copiedId: number | null;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
}

export const KeyCards: React.FC<KeyCardsProps> = ({
  keys,
  visibility,
  revealedKeys,
  onToggleReveal,
  onCopyKey,
  onEdit,
  onDelete,
  onClone,
  onTouch,
  onViewDetails,
  copiedId,
  selectedIds,
  onToggleSelect,
}) => {
  const [revealedOrgIds, setRevealedOrgIds] = useState<Record<number, boolean>>({});
  const [revealedClientIds, setRevealedClientIds] = useState<Record<number, boolean>>({});
  const [copiedOrgId, setCopiedOrgId] = useState<number | null>(null);
  const [copiedClientId, setCopiedClientId] = useState<number | null>(null);

  const toggleOrgReveal = (id: number) => {
    setRevealedOrgIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleClientReveal = (id: number) => {
    setRevealedClientIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyOrg = (orgId: string, appName: string, id: number) => {
    navigator.clipboard.writeText(orgId);
    setCopiedOrgId(id);
    setTimeout(() => setCopiedOrgId(null), 2000);
    onCopyKey(orgId, `${appName} (Org ID)`);
  };

  const handleCopyClient = (clientId: string, appName: string, id: number) => {
    navigator.clipboard.writeText(clientId);
    setCopiedClientId(id);
    setTimeout(() => setCopiedClientId(null), 2000);
    onCopyKey(clientId, `${appName} (Client ID)`);
  };

  if (keys.length === 0) {
    return (
      <div className="w-full py-12 text-center text-[#71717a] dark:text-[#a1a1aa] bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-6">
        <Shield className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#71717a]" />
        <p className="text-sm font-medium">No API Keys found</p>
        <p className="text-xs mt-1">Adjust search filters or add a new key.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
      {keys.map((item) => {
        const isRevealed = !!revealedKeys[item.id];
        const isCopied = copiedId === item.id;
        const isSelected = selectedIds.includes(item.id);

        return (
          <div
            key={item.id}
            id={`key-card-${item.id}`}
            className={`bg-white dark:bg-[#18181b] border rounded-2xl p-4 transition-all shadow-xs flex flex-col justify-between relative ${
              isSelected
                ? "border-zinc-500 ring-2 ring-zinc-500/20 bg-zinc-100/60 dark:bg-zinc-800/40"
                : "border-[#e4e4e7] dark:border-[#27272a] hover:border-zinc-400 dark:hover:border-zinc-600"
            }`}
          >
            {/* Top Row: App Name, ID, Checkbox & Status */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`card-select-${item.id}`}
                    checked={isSelected}
                    onChange={() => onToggleSelect(item.id)}
                    className="rounded border-[#d4d4d8] dark:border-[#3f3f46] text-[#09090b] dark:text-[#f4f4f5] focus:ring-[#71717a] cursor-pointer mt-0.5"
                  />
                  <div>
                    <h3
                      onClick={() => onViewDetails(item)}
                      className="font-semibold text-[#09090b] dark:text-[#f4f4f5] text-sm hover:text-[#52525b] dark:hover:text-[#e4e4e7] cursor-pointer transition-colors leading-tight"
                    >
                      {item.app_name}
                    </h3>
                    <span className="text-[10px] text-[#71717a] dark:text-[#71717a] font-mono">
                      ID #{item.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {visibility.environment && <EnvironmentBadge environment={item.environment} size="sm" />}
                  {visibility.status && <StatusBadge item={item} size="sm" />}
                </div>
              </div>

              {/* Purpose / Description */}
              {visibility.purpose && item.purpose && (
                <p className="text-xs text-[#52525b] dark:text-[#a1a1aa] line-clamp-2 mb-3 bg-[#f4f4f5] dark:bg-[#27272a] p-2 rounded-lg border border-[#e4e4e7] dark:border-[#3f3f46]">
                  {item.purpose}
                </p>
              )}

              {/* Core Key Box (Always Visible) */}
              <div className="mb-2">
                <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa] block mb-1 font-medium">API Key / Token</span>
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-[#3f3f46]">
                  <span
                    className={`font-mono text-xs select-all truncate ${
                      isRevealed ? "text-[#09090b] dark:text-[#f4f4f5] font-semibold" : "text-[#52525b] dark:text-[#d4d4d8]"
                    }`}
                  >
                    {maskKey(item.key_value, isRevealed)}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      id={`card-eye-${item.id}`}
                      onClick={() => onToggleReveal(item.id)}
                      className="p-1.5 rounded-lg text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] transition-colors cursor-pointer"
                      title={isRevealed ? "Mask Key" : "Reveal Key"}
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      id={`card-copy-${item.id}`}
                      onClick={() => onCopyKey(item.key_value, item.app_name)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isCopied
                          ? "bg-[#09090b] text-white dark:bg-[#f4f4f5] dark:text-[#09090b] font-medium shadow-xs"
                          : "text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46]"
                      }`}
                      title="Copy Key"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional Org ID and Client ID with Masking & Copying */}
              {(visibility.org_id && item.org_id) || (visibility.client_id && item.client_id) ? (
                <div className="space-y-2 mb-3">
                  {visibility.org_id && item.org_id && (
                    <div>
                      <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa] block mb-0.5 font-medium">Organization ID</span>
                      <div className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-xl bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-[#3f3f46]">
                        <span
                          className={`font-mono text-xs select-all truncate ${
                            revealedOrgIds[item.id] ? "text-[#09090b] dark:text-[#f4f4f5] font-semibold" : "text-[#52525b] dark:text-[#d4d4d8]"
                          }`}
                        >
                          {maskKey(item.org_id, !!revealedOrgIds[item.id])}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            id={`card-org-eye-${item.id}`}
                            onClick={() => toggleOrgReveal(item.id)}
                            className="p-1 rounded-lg text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] transition-colors cursor-pointer"
                            title={revealedOrgIds[item.id] ? "Mask Org ID" : "Reveal Org ID"}
                          >
                            {revealedOrgIds[item.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            id={`card-org-copy-${item.id}`}
                            onClick={() => handleCopyOrg(item.org_id!, item.app_name, item.id)}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              copiedOrgId === item.id
                                ? "bg-[#09090b] text-white dark:bg-[#f4f4f5] dark:text-[#09090b]"
                                : "text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46]"
                            }`}
                            title="Copy Org ID"
                          >
                            {copiedOrgId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {visibility.client_id && item.client_id && (
                    <div>
                      <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa] block mb-0.5 font-medium">Client ID</span>
                      <div className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-xl bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-[#3f3f46]">
                        <span
                          className={`font-mono text-xs select-all truncate ${
                            revealedClientIds[item.id] ? "text-[#09090b] dark:text-[#f4f4f5] font-semibold" : "text-[#52525b] dark:text-[#d4d4d8]"
                          }`}
                        >
                          {maskKey(item.client_id, !!revealedClientIds[item.id])}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            id={`card-client-eye-${item.id}`}
                            onClick={() => toggleClientReveal(item.id)}
                            className="p-1 rounded-lg text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] transition-colors cursor-pointer"
                            title={revealedClientIds[item.id] ? "Mask Client ID" : "Reveal Client ID"}
                          >
                            {revealedClientIds[item.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            id={`card-client-copy-${item.id}`}
                            onClick={() => handleCopyClient(item.client_id!, item.app_name, item.id)}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              copiedClientId === item.id
                                ? "bg-[#09090b] text-white dark:bg-[#f4f4f5] dark:text-[#09090b]"
                                : "text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46]"
                            }`}
                            title="Copy Client ID"
                          >
                            {copiedClientId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Dynamic Metadata Attributes */}
              <div className="grid grid-cols-2 gap-2 text-xs py-1 border-t border-[#e4e4e7] dark:border-[#27272a]">
                {visibility.project && item.project && (
                  <div>
                    <span className="text-[10px] text-[#71717a] dark:text-[#71717a] block uppercase font-medium">
                      Project
                    </span>
                    <span className="text-[#09090b] dark:text-[#f4f4f5] font-medium truncate block">
                      {item.project}
                    </span>
                  </div>
                )}

                {visibility.account && item.account && (
                  <div>
                    <span className="text-[10px] text-[#71717a] dark:text-[#71717a] block uppercase font-medium">
                      Account
                    </span>
                    <span className="text-[#52525b] dark:text-[#a1a1aa] font-mono text-[11px] truncate block">
                      {item.account}
                    </span>
                  </div>
                )}

                {visibility.expiry_date && (
                  <div>
                    <span className="text-[10px] text-[#71717a] dark:text-[#71717a] block uppercase font-medium">
                      Expires
                    </span>
                    <span className="text-[#52525b] dark:text-[#a1a1aa] block font-mono text-[11px]">
                      {formatDate(item.expiry_date)}
                    </span>
                  </div>
                )}

                {visibility.last_used_date && (
                  <div>
                    <span className="text-[10px] text-[#71717a] dark:text-[#71717a] block uppercase font-medium">
                      Last Active
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[#52525b] dark:text-[#a1a1aa] truncate text-[11px]">
                        {formatRelativeTime(item.last_used_date)}
                      </span>
                      <button
                        onClick={() => onTouch(item.id)}
                        className="text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] p-0.5"
                        title="Touch / Used Now"
                      >
                        <Clock className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {visibility.ip_restrictions && item.ip_restrictions && (
                  <div className="col-span-2">
                    <span className="text-[10px] text-[#71717a] dark:text-[#71717a] block uppercase font-medium">
                      IP Scope
                    </span>
                    <span className="text-[#52525b] dark:text-[#a1a1aa] font-mono text-[11px] truncate block">
                      {item.ip_restrictions}
                    </span>
                  </div>
                )}

                {visibility.portal_url && item.portal_url && (
                  <div className="col-span-2">
                    <a
                      href={item.portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#09090b] dark:text-[#f4f4f5] hover:underline text-xs"
                    >
                      <ExternalLink className="w-3 h-3 text-[#71717a]" />
                      <span>{item.portal_url.replace(/^https?:\/\//, "")}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Card Actions */}
            <div className="mt-3 pt-2.5 border-t border-[#e4e4e7] dark:border-[#27272a] flex items-center justify-between">
              <span className="text-[10px] text-[#71717a] dark:text-[#71717a]">
                {visibility.created_date ? `Added ${formatDate(item.created_date)}` : `Key #${item.id}`}
              </span>

              <div className="flex items-center gap-1">
                <button
                  id={`card-details-btn-${item.id}`}
                  onClick={() => onViewDetails(item)}
                  className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] rounded-lg transition-colors cursor-pointer"
                  title="Details"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  id={`card-edit-btn-${item.id}`}
                  onClick={() => onEdit(item)}
                  className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] rounded-lg transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  id={`card-clone-btn-${item.id}`}
                  onClick={() => onClone(item.id)}
                  className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] rounded-lg transition-colors cursor-pointer"
                  title="Duplicate"
                >
                  <CopyPlus className="w-4 h-4" />
                </button>
                <button
                  id={`card-delete-btn-${item.id}`}
                  onClick={() => onDelete(item.id, item.app_name)}
                  className="p-1.5 text-[#71717a] hover:text-rose-600 dark:text-[#a1a1aa] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
