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
  MoreVertical,
  Edit2,
  Trash2,
  CopyPlus,
  Clock,
  Info,
  Shield,
  ArrowUpDown,
} from "lucide-react";

interface KeyTableProps {
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
  onSelectAll: () => void;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  onSortChange: (column: string) => void;
}

export const KeyTable: React.FC<KeyTableProps> = ({
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
  onSelectAll,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
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

  const allSelected = keys.length > 0 && selectedIds.length === keys.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < keys.length;

  return (
    <div className="w-full bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table id="api-keys-table" className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-[#f4f4f5] dark:bg-[#27272a]/70 border-b border-[#e4e4e7] dark:border-[#27272a] text-[#71717a] dark:text-[#a1a1aa] font-semibold select-none">
              {/* Checkbox column */}
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  id="select-all-keys"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={onSelectAll}
                  className="rounded border-[#d4d4d8] dark:border-[#3f3f46] text-[#09090b] dark:text-[#f4f4f5] focus:ring-[#71717a] cursor-pointer"
                />
              </th>

              {/* ALWAYS VISIBLE: App Name */}
              <th
                onClick={() => onSortChange("app_name")}
                className="py-3 px-4 cursor-pointer hover:text-[#09090b] dark:hover:text-[#f4f4f5] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>App Name & ID</span>
                  <ArrowUpDown className={`w-3 h-3 ${sortBy === "app_name" ? "text-[#09090b] dark:text-[#f4f4f5]" : "opacity-40"}`} />
                </div>
              </th>

              {/* ALWAYS VISIBLE: Key Value */}
              <th className="py-3 px-4 min-w-[200px]">API Key / Secret Token</th>

              {/* OPTIONAL: Org ID */}
              {visibility.org_id && (
                <th
                  onClick={() => onSortChange("org_id")}
                  className="py-3 px-3 cursor-pointer hover:text-[#09090b] dark:hover:text-[#f4f4f5] transition-colors min-w-[140px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Org ID</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "org_id" ? "text-[#09090b] dark:text-[#f4f4f5]" : "opacity-40"}`} />
                  </div>
                </th>
              )}

              {/* OPTIONAL: Client ID */}
              {visibility.client_id && (
                <th
                  onClick={() => onSortChange("client_id")}
                  className="py-3 px-3 cursor-pointer hover:text-[#09090b] dark:hover:text-[#f4f4f5] transition-colors min-w-[140px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Client ID</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "client_id" ? "text-[#09090b] dark:text-[#f4f4f5]" : "opacity-40"}`} />
                  </div>
                </th>
              )}

              {/* OPTIONAL: Status */}
              {visibility.status && (
                <th
                  onClick={() => onSortChange("status")}
                  className="py-3 px-4 cursor-pointer hover:text-[#09090b] dark:hover:text-[#f4f4f5] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status & Lifecycle</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "status" ? "text-[#09090b] dark:text-[#f4f4f5]" : "opacity-40"}`} />
                  </div>
                </th>
              )}

              {/* OPTIONAL: Environment */}
              {visibility.environment && (
                <th
                  onClick={() => onSortChange("environment")}
                  className="py-3 px-3 cursor-pointer hover:text-[#09090b] dark:hover:text-[#f4f4f5] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Env</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "environment" ? "text-[#09090b] dark:text-[#f4f4f5]" : "opacity-40"}`} />
                  </div>
                </th>
              )}

              {/* OPTIONAL: Project */}
              {visibility.project && (
                <th
                  onClick={() => onSortChange("project")}
                  className="py-3 px-3 cursor-pointer hover:text-[#09090b] dark:hover:text-[#f4f4f5] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Project / Service</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "project" ? "text-[#09090b] dark:text-[#f4f4f5]" : "opacity-40"}`} />
                  </div>
                </th>
              )}

              {/* OPTIONAL: Account */}
              {visibility.account && <th className="py-3 px-3">Account / Owner</th>}

              {/* OPTIONAL: Expiry Date */}
              {visibility.expiry_date && (
                <th
                  onClick={() => onSortChange("expiry_date")}
                  className="py-3 px-3 cursor-pointer hover:text-[#09090b] dark:hover:text-[#f4f4f5] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Expires</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "expiry_date" ? "text-[#09090b] dark:text-[#f4f4f5]" : "opacity-40"}`} />
                  </div>
                </th>
              )}

              {/* OPTIONAL: Last Used Date */}
              {visibility.last_used_date && (
                <th
                  onClick={() => onSortChange("last_used_date")}
                  className="py-3 px-3 cursor-pointer hover:text-[#09090b] dark:hover:text-[#f4f4f5] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Last Active</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "last_used_date" ? "text-[#09090b] dark:text-[#f4f4f5]" : "opacity-40"}`} />
                  </div>
                </th>
              )}

              {/* OPTIONAL: IP Restrictions */}
              {visibility.ip_restrictions && <th className="py-3 px-3">IP Scope</th>}

              {/* OPTIONAL: Portal URL */}
              {visibility.portal_url && <th className="py-3 px-3">Portal</th>}

              {/* OPTIONAL: Creator Contact */}
              {visibility.creator_contact && <th className="py-3 px-3">Creator</th>}

              {/* OPTIONAL: Created Date */}
              {visibility.created_date && (
                <th
                  onClick={() => onSortChange("created_date")}
                  className="py-3 px-3 cursor-pointer hover:text-[#09090b] dark:hover:text-[#f4f4f5] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Created</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "created_date" ? "text-[#09090b] dark:text-[#f4f4f5]" : "opacity-40"}`} />
                  </div>
                </th>
              )}

              {/* Actions Column */}
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#f4f4f5] dark:divide-[#27272a] font-mono text-xs">
            {keys.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-12 text-center text-[#71717a] dark:text-[#a1a1aa]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Shield className="w-8 h-8 opacity-40 text-[#71717a]" />
                    <p className="text-sm font-medium font-sans">No API Keys found</p>
                    <p className="text-xs font-sans">Adjust your search/filters or register a new API key.</p>
                  </div>
                </td>
              </tr>
            ) : (
              keys.map((item) => {
                const isRevealed = !!revealedKeys[item.id];
                const isCopied = copiedId === item.id;
                const isSelected = selectedIds.includes(item.id);

                return (
                  <tr
                    key={item.id}
                    id={`key-row-${item.id}`}
                    className={`group transition-colors hover:bg-[#f4f4f5]/60 dark:hover:bg-[#27272a]/40 ${
                      isSelected ? "bg-zinc-200/50 dark:bg-zinc-800/50" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3.5 text-center">
                      <input
                        type="checkbox"
                        id={`select-key-${item.id}`}
                        checked={isSelected}
                        onChange={() => onToggleSelect(item.id)}
                        className="rounded border-[#d4d4d8] dark:border-[#3f3f46] text-[#09090b] dark:text-[#f4f4f5] focus:ring-[#71717a] cursor-pointer"
                      />
                    </td>

                    {/* App Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDetails(item)}
                          className="font-semibold text-[#09090b] dark:text-[#f4f4f5] hover:text-[#52525b] dark:hover:text-[#e4e4e7] text-left transition-colors cursor-pointer group-hover:underline font-sans"
                        >
                          {item.app_name}
                        </button>
                        <span className="text-[10px] text-[#71717a] dark:text-[#71717a] font-mono">
                          #{item.id}
                        </span>
                      </div>
                      {item.purpose && visibility.purpose && (
                        <p className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] line-clamp-1 max-w-xs mt-0.5 font-sans">
                          {item.purpose}
                        </p>
                      )}
                    </td>

                    {/* Key Value & Inline Actions */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 p-1 px-2 rounded-lg bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-[#3f3f46] max-w-xs">
                        <span
                          className={`font-mono text-xs select-all truncate ${
                            isRevealed ? "text-[#09090b] dark:text-[#f4f4f5] font-semibold" : "text-[#52525b] dark:text-[#d4d4d8]"
                          }`}
                        >
                          {maskKey(item.key_value, isRevealed)}
                        </span>

                        {/* Inline Eye Toggle */}
                        <button
                          id={`toggle-eye-${item.id}`}
                          onClick={() => onToggleReveal(item.id)}
                          className="p-1 rounded text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] transition-colors cursor-pointer shrink-0"
                          title={isRevealed ? "Mask Key" : "Reveal Key"}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        {/* Inline Copy Button with Visual Feedback */}
                        <button
                          id={`copy-btn-${item.id}`}
                          onClick={() => onCopyKey(item.key_value, item.app_name)}
                          className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                            isCopied
                              ? "bg-[#09090b] text-white dark:bg-[#f4f4f5] dark:text-[#09090b] font-medium"
                              : "text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46]"
                          }`}
                          title="Copy Key to Clipboard"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Org ID */}
                    {visibility.org_id && (
                      <td className="py-3 px-3">
                        {item.org_id ? (
                          <div className="inline-flex items-center gap-1 p-0.5 px-1.5 rounded-lg bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-[#3f3f46] max-w-[150px]">
                            <span
                              className={`font-mono text-xs select-all truncate ${
                                revealedOrgIds[item.id] ? "text-[#09090b] dark:text-[#f4f4f5] font-semibold" : "text-[#52525b] dark:text-[#d4d4d8]"
                              }`}
                            >
                              {maskKey(item.org_id, !!revealedOrgIds[item.id])}
                            </span>
                            <button
                              id={`toggle-org-eye-${item.id}`}
                              onClick={() => toggleOrgReveal(item.id)}
                              className="p-1 rounded text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] transition-colors cursor-pointer shrink-0"
                              title={revealedOrgIds[item.id] ? "Mask Org ID" : "Reveal Org ID"}
                            >
                              {revealedOrgIds[item.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              id={`copy-org-btn-${item.id}`}
                              onClick={() => handleCopyOrg(item.org_id!, item.app_name, item.id)}
                              className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                                copiedOrgId === item.id
                                  ? "bg-[#09090b] text-white dark:bg-[#f4f4f5] dark:text-[#09090b]"
                                  : "text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46]"
                              }`}
                              title="Copy Org ID"
                            >
                              {copiedOrgId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#a1a1aa] dark:text-[#71717a]">—</span>
                        )}
                      </td>
                    )}

                    {/* Client ID */}
                    {visibility.client_id && (
                      <td className="py-3 px-3">
                        {item.client_id ? (
                          <div className="inline-flex items-center gap-1 p-0.5 px-1.5 rounded-lg bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-[#3f3f46] max-w-[150px]">
                            <span
                              className={`font-mono text-xs select-all truncate ${
                                revealedClientIds[item.id] ? "text-[#09090b] dark:text-[#f4f4f5] font-semibold" : "text-[#52525b] dark:text-[#d4d4d8]"
                              }`}
                            >
                              {maskKey(item.client_id, !!revealedClientIds[item.id])}
                            </span>
                            <button
                              id={`toggle-client-eye-${item.id}`}
                              onClick={() => toggleClientReveal(item.id)}
                              className="p-1 rounded text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] transition-colors cursor-pointer shrink-0"
                              title={revealedClientIds[item.id] ? "Mask Client ID" : "Reveal Client ID"}
                            >
                              {revealedClientIds[item.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              id={`copy-client-btn-${item.id}`}
                              onClick={() => handleCopyClient(item.client_id!, item.app_name, item.id)}
                              className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                                copiedClientId === item.id
                                  ? "bg-[#09090b] text-white dark:bg-[#f4f4f5] dark:text-[#09090b]"
                                  : "text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46]"
                              }`}
                              title="Copy Client ID"
                            >
                              {copiedClientId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#a1a1aa] dark:text-[#71717a]">—</span>
                        )}
                      </td>
                    )}

                    {/* Status Badge */}
                    {visibility.status && (
                      <td className="py-3 px-4">
                        <StatusBadge item={item} size="sm" showSubtext={true} />
                      </td>
                    )}

                    {/* Environment */}
                    {visibility.environment && (
                      <td className="py-3 px-3">
                        <EnvironmentBadge environment={item.environment} size="sm" />
                      </td>
                    )}

                    {/* Project */}
                    {visibility.project && (
                      <td className="py-3 px-3">
                        <span className="text-[#09090b] dark:text-[#f4f4f5] font-medium truncate max-w-[140px] block font-sans">
                          {item.project || "—"}
                        </span>
                      </td>
                    )}

                    {/* Account */}
                    {visibility.account && (
                      <td className="py-3 px-3">
                        <span className="text-[#52525b] dark:text-[#a1a1aa] font-mono text-[11px] truncate max-w-[120px] block">
                          {item.account || "—"}
                        </span>
                      </td>
                    )}

                    {/* Expiry Date */}
                    {visibility.expiry_date && (
                      <td className="py-3 px-3">
                        <span className="text-[#52525b] dark:text-[#a1a1aa] whitespace-nowrap font-mono text-[11px]">
                          {formatDate(item.expiry_date)}
                        </span>
                      </td>
                    )}

                    {/* Last Used Date */}
                    {visibility.last_used_date && (
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-[#52525b] dark:text-[#a1a1aa] whitespace-nowrap font-sans text-[11px]">
                          <span>{formatRelativeTime(item.last_used_date)}</span>
                          <button
                            id={`touch-btn-${item.id}`}
                            onClick={() => onTouch(item.id)}
                            className="p-1 rounded text-[#71717a] hover:text-[#09090b] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Mark as Used Now"
                          >
                            <Clock className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    )}

                    {/* IP Restrictions */}
                    {visibility.ip_restrictions && (
                      <td className="py-3 px-3">
                        {item.ip_restrictions ? (
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#f4f4f5] dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] border border-[#e4e4e7] dark:border-[#3f3f46] truncate max-w-[120px] block">
                            {item.ip_restrictions}
                          </span>
                        ) : (
                          <span className="text-[#a1a1aa] dark:text-[#71717a]">—</span>
                        )}
                      </td>
                    )}

                    {/* Portal URL */}
                    {visibility.portal_url && (
                      <td className="py-3 px-3">
                        {item.portal_url ? (
                          <a
                            id={`portal-link-${item.id}`}
                            href={item.portal_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#09090b] dark:text-[#f4f4f5] hover:underline text-xs font-sans"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3 text-[#71717a]" />
                          </a>
                        ) : (
                          <span className="text-[#a1a1aa] dark:text-[#71717a]">—</span>
                        )}
                      </td>
                    )}

                    {/* Creator Contact */}
                    {visibility.creator_contact && (
                      <td className="py-3 px-3">
                        <span className="text-[#52525b] dark:text-[#a1a1aa] truncate max-w-[110px] block font-sans">
                          {item.creator_contact || "—"}
                        </span>
                      </td>
                    )}

                    {/* Created Date */}
                    {visibility.created_date && (
                      <td className="py-3 px-3">
                        <span className="text-[#71717a] dark:text-[#71717a] whitespace-nowrap font-mono text-[11px]">
                          {formatDate(item.created_date)}
                        </span>
                      </td>
                    )}

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          id={`view-details-${item.id}`}
                          onClick={() => onViewDetails(item)}
                          className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`edit-key-${item.id}`}
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] rounded-lg transition-colors cursor-pointer"
                          title="Edit Key"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`clone-key-${item.id}`}
                          onClick={() => onClone(item.id)}
                          className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] rounded-lg transition-colors cursor-pointer hidden sm:inline-flex"
                          title="Duplicate / Clone"
                        >
                          <CopyPlus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-key-${item.id}`}
                          onClick={() => onDelete(item.id, item.app_name)}
                          className="p-1.5 text-[#71717a] hover:text-rose-600 dark:text-[#a1a1aa] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete Key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
