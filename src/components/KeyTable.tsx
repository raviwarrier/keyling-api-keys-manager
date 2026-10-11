import React, { useState } from "react";
import { ApiKeyItem, FieldVisibilitySettings, ColumnKey, OptionalFieldKey } from "../types";
import { maskKey, formatDate, formatRelativeTime } from "../utils/formatters";
import { StatusBadge } from "./StatusBadge";
import { EnvironmentBadge } from "./EnvironmentBadge";
import { DEFAULT_COLUMN_ORDER } from "../constants/fieldConfig";
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
  Shield,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ColumnMeta {
  label: string;
  isSortable?: boolean;
  className?: string;
}

const COLUMN_DEFINITIONS: Record<ColumnKey, ColumnMeta> = {
  app_name: {
    label: "App Name & ID",
    isSortable: true,
    className: "py-3 px-4",
  },
  key_value: {
    label: "API Key / Secret Token",
    className: "py-3 px-4 min-w-[200px]",
  },
  provider: {
    label: "API Provider",
    isSortable: true,
    className: "py-3 px-3.5 min-w-[130px]",
  },
  org_id: {
    label: "Org ID",
    isSortable: true,
    className: "py-3 px-3 min-w-[140px]",
  },
  client_id: {
    label: "Client ID",
    isSortable: true,
    className: "py-3 px-3 min-w-[140px]",
  },
  status: {
    label: "Status & Lifecycle",
    isSortable: true,
    className: "py-3 px-4",
  },
  environment: {
    label: "Env",
    isSortable: true,
    className: "py-3 px-3",
  },
  project: {
    label: "App / Service / Project",
    isSortable: true,
    className: "py-3 px-3 min-w-[150px]",
  },
  account: {
    label: "Account / Owner",
    className: "py-3 px-3 min-w-[120px]",
  },
  expiry_date: {
    label: "Expires",
    isSortable: true,
    className: "py-3 px-3",
  },
  last_used_date: {
    label: "Last Active",
    isSortable: true,
    className: "py-3 px-3",
  },
  ip_restrictions: {
    label: "IP Scope",
    className: "py-3 px-3",
  },
  portal_url: {
    label: "Portal",
    className: "py-3 px-3",
  },
  creator_contact: {
    label: "Creator",
    className: "py-3 px-3",
  },
  created_date: {
    label: "Created",
    isSortable: true,
    className: "py-3 px-3",
  },
};

// --- Subcomponents for Individual Cells to minimize Cognitive Complexity ---

interface HeaderCellProps {
  colKey: ColumnKey;
  columnOrder: ColumnKey[];
  sortBy: string;
  sortOrder?: "ASC" | "DESC";
  onSortChange: (column: string) => void;
  onReorderColumns?: (newOrder: ColumnKey[]) => void;
}

const HeaderCell: React.FC<HeaderCellProps> = ({
  colKey,
  columnOrder,
  sortBy,
  sortOrder,
  onSortChange,
  onReorderColumns,
}) => {
  const config = COLUMN_DEFINITIONS[colKey];
  if (!config) return null;

  const colIndex = columnOrder.indexOf(colKey);
  const canMoveLeft = colIndex > 0;
  const canMoveRight = colIndex < columnOrder.length - 1;

  const baseClasses = config.className || "py-3 px-3";
  const thClass = `${baseClasses} whitespace-nowrap group/th`.trim();

  const handleMove = (direction: "left" | "right", e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onReorderColumns) return;
    const newOrder = [...columnOrder];
    const [moved] = newOrder.splice(colIndex, 1);
    const targetIdx = direction === "left" ? colIndex - 1 : colIndex + 1;
    newOrder.splice(targetIdx, 0, moved);
    onReorderColumns(newOrder);
  };

  let sortTitle = `Sort by ${config.label}`;
  if (sortBy === colKey && sortOrder) {
    const directionLabel = sortOrder === "ASC" ? "Ascending" : "Descending";
    sortTitle += ` (${directionLabel})`;
  }

  return (
    <th className={thClass}>
      <div className="flex items-center justify-between gap-1.5">
        {config.isSortable ? (
          <button
            type="button"
            onClick={() => onSortChange(colKey)}
            className="flex items-center gap-1.5 hover:text-[#09090b] dark:hover:text-[#f4f4f5] transition-colors cursor-pointer text-left select-none font-medium"
            title={sortTitle}
          >
            <span>{config.label}</span>
            <ArrowUpDown
              className={`w-3 h-3 ${
                sortBy === colKey
                  ? "text-[#09090b] dark:text-[#f4f4f5]"
                  : "opacity-40"
              }`}
            />
          </button>
        ) : (
          <span>{config.label}</span>
        )}

        {onReorderColumns && (
          <div className="opacity-0 group-hover/th:opacity-100 flex items-center transition-opacity">
            <button
              type="button"
              onClick={(e) => handleMove("left", e)}
              disabled={!canMoveLeft}
              className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded disabled:opacity-20 cursor-pointer"
              title="Move column left"
              aria-label={`Move ${config.label} column left`}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => handleMove("right", e)}
              disabled={!canMoveRight}
              className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded disabled:opacity-20 cursor-pointer"
              title="Move column right"
              aria-label={`Move ${config.label} column right`}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </th>
  );
};

const AppNameCell: React.FC<{
  item: ApiKeyItem;
  showPurpose?: boolean;
  onViewDetails: (item: ApiKeyItem) => void;
}> = ({ item, showPurpose, onViewDetails }) => (
  <td className="py-3 px-4">
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onViewDetails(item)}
        className="font-semibold text-[#09090b] dark:text-[#f4f4f5] hover:text-[#52525b] dark:hover:text-[#e4e4e7] text-left transition-colors cursor-pointer group-hover:underline font-mono"
        aria-label={`View details for ${item.app_name}`}
      >
        {item.app_name}
      </button>
      <span className="text-[10px] text-[#71717a] dark:text-[#71717a] font-mono">
        #{item.id}
      </span>
    </div>
    {item.purpose && showPurpose && (
      <p className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] line-clamp-1 max-w-xs mt-0.5 font-sans">
        {item.purpose}
      </p>
    )}
  </td>
);

const KeyValueCell: React.FC<{
  item: ApiKeyItem;
  isRevealed: boolean;
  isCopied: boolean;
  onToggleReveal: (id: number) => void;
  onCopyKey: (keyText: string, appName: string) => void;
}> = ({ item, isRevealed, isCopied, onToggleReveal, onCopyKey }) => (
  <td className="py-3 px-4">
    <div className="inline-flex items-center gap-1.5 p-1 px-2 rounded-lg bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-[#3f3f46] max-w-xs">
      <span
        className={`font-mono text-xs select-all truncate ${
          isRevealed
            ? "text-[#09090b] dark:text-[#f4f4f5] font-semibold"
            : "text-[#52525b] dark:text-[#d4d4d8]"
        }`}
      >
        {maskKey(item.key_value, isRevealed)}
      </span>

      <button
        type="button"
        id={`toggle-eye-${item.id}`}
        onClick={() => onToggleReveal(item.id)}
        className="p-1 rounded text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] transition-colors cursor-pointer shrink-0"
        title={isRevealed ? "Mask Key" : "Reveal Key"}
        aria-label={
          isRevealed
            ? `Mask API key for ${item.app_name}`
            : `Reveal API key for ${item.app_name}`
        }
      >
        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>

      <button
        type="button"
        id={`copy-btn-${item.id}`}
        onClick={() => onCopyKey(item.key_value, item.app_name)}
        className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
          isCopied
            ? "bg-[#09090b] text-white dark:bg-[#f4f4f5] dark:text-[#09090b] font-medium"
            : "text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46]"
        }`}
        title="Copy Key to Clipboard"
        aria-label={`Copy API key for ${item.app_name}`}
      >
        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  </td>
);

const MaskedSecretCell: React.FC<{
  item: ApiKeyItem;
  value?: string | null;
  type: "org" | "client";
  isRevealed: boolean;
  isCopied: boolean;
  onToggleReveal: (id: number) => void;
  onCopy: (val: string, appName: string, id: number) => void;
}> = ({ item, value, type, isRevealed, isCopied, onToggleReveal, onCopy }) => {
  const labelPrefix = type === "org" ? "Org ID" : "Client ID";
  const eyeBtnId = type === "org" ? `toggle-org-eye-${item.id}` : `toggle-client-eye-${item.id}`;
  const copyBtnId = type === "org" ? `copy-org-btn-${item.id}` : `copy-client-btn-${item.id}`;

  if (!value) {
    return (
      <td className="py-3 px-3">
        <span className="text-[#a1a1aa] dark:text-[#71717a]">—</span>
      </td>
    );
  }

  return (
    <td className="py-3 px-3">
      <div className="inline-flex items-center gap-1 p-0.5 px-1.5 rounded-lg bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-[#3f3f46] max-w-[150px]">
        <span
          className={`font-mono text-xs select-all truncate ${
            isRevealed
              ? "text-[#09090b] dark:text-[#f4f4f5] font-semibold"
              : "text-[#52525b] dark:text-[#d4d4d8]"
          }`}
        >
          {maskKey(value, isRevealed)}
        </span>
        <button
          type="button"
          id={eyeBtnId}
          onClick={() => onToggleReveal(item.id)}
          className="p-1 rounded text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46] transition-colors cursor-pointer shrink-0"
          title={isRevealed ? `Mask ${labelPrefix}` : `Reveal ${labelPrefix}`}
          aria-label={
            isRevealed
              ? `Mask ${labelPrefix} for ${item.app_name}`
              : `Reveal ${labelPrefix} for ${item.app_name}`
          }
        >
          {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
        <button
          type="button"
          id={copyBtnId}
          onClick={() => onCopy(value, item.app_name, item.id)}
          className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
            isCopied
              ? "bg-[#09090b] text-white dark:bg-[#f4f4f5] dark:text-[#09090b]"
              : "text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46]"
          }`}
          title={`Copy ${labelPrefix}`}
          aria-label={`Copy ${labelPrefix} for ${item.app_name}`}
        >
          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </td>
  );
};

const LastUsedCell: React.FC<{
  item: ApiKeyItem;
  onTouch: (id: number) => void;
}> = ({ item, onTouch }) => (
  <td className="py-3 px-3">
    <div className="flex items-center gap-1.5 text-[#52525b] dark:text-[#a1a1aa] whitespace-nowrap font-sans text-[11px]">
      <span>{formatRelativeTime(item.last_used_date)}</span>
      <button
        type="button"
        id={`touch-btn-${item.id}`}
        onClick={() => onTouch(item.id)}
        className="p-1 rounded text-[#71717a] hover:text-[#09090b] dark:hover:text-[#f4f4f5] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
        title="Mark as Used Now"
        aria-label={`Mark key for ${item.app_name} as used now`}
      >
        <Clock className="w-3 h-3" />
      </button>
    </div>
  </td>
);

interface KeyTableCellProps {
  item: ApiKeyItem;
  colKey: ColumnKey;
  isRevealed: boolean;
  isCopied: boolean;
  isOrgRevealed: boolean;
  isOrgCopied: boolean;
  isClientRevealed: boolean;
  isClientCopied: boolean;
  visibility: FieldVisibilitySettings;
  onToggleReveal: (id: number) => void;
  onCopyKey: (keyText: string, appName: string) => void;
  toggleOrgReveal: (id: number) => void;
  handleCopyOrg: (val: string, name: string, id: number) => void;
  toggleClientReveal: (id: number) => void;
  handleCopyClient: (val: string, name: string, id: number) => void;
  onViewDetails: (item: ApiKeyItem) => void;
  onTouch: (id: number) => void;
}

const KeyTableCell: React.FC<KeyTableCellProps> = ({
  item,
  colKey,
  isRevealed,
  isCopied,
  isOrgRevealed,
  isOrgCopied,
  isClientRevealed,
  isClientCopied,
  visibility,
  onToggleReveal,
  onCopyKey,
  toggleOrgReveal,
  handleCopyOrg,
  toggleClientReveal,
  handleCopyClient,
  onViewDetails,
  onTouch,
}) => {
  switch (colKey) {
    case "app_name":
      return (
        <AppNameCell
          item={item}
          showPurpose={visibility.purpose}
          onViewDetails={onViewDetails}
        />
      );

    case "key_value":
      return (
        <KeyValueCell
          item={item}
          isRevealed={isRevealed}
          isCopied={isCopied}
          onToggleReveal={onToggleReveal}
          onCopyKey={onCopyKey}
        />
      );

    case "provider":
      return (
        <td className="py-3 px-3.5">
          {item.provider ? (
            <span className="font-sans font-medium text-xs text-[#09090b] dark:text-[#f4f4f5] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 truncate max-w-[130px] inline-block">
              {item.provider}
            </span>
          ) : (
            <span className="text-[#a1a1aa] dark:text-[#71717a]">—</span>
          )}
        </td>
      );

    case "org_id":
      return (
        <MaskedSecretCell
          item={item}
          value={item.org_id}
          type="org"
          isRevealed={isOrgRevealed}
          isCopied={isOrgCopied}
          onToggleReveal={toggleOrgReveal}
          onCopy={handleCopyOrg}
        />
      );

    case "client_id":
      return (
        <MaskedSecretCell
          item={item}
          value={item.client_id}
          type="client"
          isRevealed={isClientRevealed}
          isCopied={isClientCopied}
          onToggleReveal={toggleClientReveal}
          onCopy={handleCopyClient}
        />
      );

    case "status":
      return (
        <td className="py-3 px-4">
          <StatusBadge item={item} size="sm" showSubtext={true} />
        </td>
      );

    case "environment":
      return (
        <td className="py-3 px-3">
          <EnvironmentBadge environment={item.environment} size="sm" />
        </td>
      );

    case "project":
      return (
        <td className="py-3 px-3">
          <span className="text-[#09090b] dark:text-[#f4f4f5] font-medium truncate max-w-[150px] block font-sans">
            {item.project || "—"}
          </span>
        </td>
      );

    case "account":
      return (
        <td className="py-3 px-3">
          <span className="text-[#52525b] dark:text-[#a1a1aa] font-mono text-[11px] truncate max-w-[120px] block">
            {item.account || "—"}
          </span>
        </td>
      );

    case "expiry_date":
      return (
        <td className="py-3 px-3">
          <span className="text-[#52525b] dark:text-[#a1a1aa] whitespace-nowrap font-mono text-[11px]">
            {formatDate(item.expiry_date)}
          </span>
        </td>
      );

    case "last_used_date":
      return <LastUsedCell item={item} onTouch={onTouch} />;

    case "ip_restrictions":
      return (
        <td className="py-3 px-3">
          {item.ip_restrictions ? (
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#f4f4f5] dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] border border-[#e4e4e7] dark:border-[#3f3f46] truncate max-w-[120px] block">
              {item.ip_restrictions}
            </span>
          ) : (
            <span className="text-[#a1a1aa] dark:text-[#71717a]">—</span>
          )}
        </td>
      );

    case "portal_url":
      return (
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
      );

    case "creator_contact":
      return (
        <td className="py-3 px-3">
          <span className="text-[#52525b] dark:text-[#a1a1aa] truncate max-w-[110px] block font-sans">
            {item.creator_contact || "—"}
          </span>
        </td>
      );

    case "created_date":
      return (
        <td className="py-3 px-3">
          <span className="text-[#71717a] dark:text-[#71717a] whitespace-nowrap font-mono text-[11px]">
            {formatDate(item.created_date)}
          </span>
        </td>
      );

    default:
      return null;
  }
};

interface RowActionsProps {
  item: ApiKeyItem;
  isSelected: boolean;
  onViewDetails: (item: ApiKeyItem) => void;
  onEdit: (item: ApiKeyItem) => void;
  onClone: (id: number) => void;
  onDelete: (id: number, appName: string) => void;
}

const RowActionsCell: React.FC<RowActionsProps> = ({
  item,
  isSelected,
  onViewDetails,
  onEdit,
  onClone,
  onDelete,
}) => (
  <td
    className={`py-3 px-4 text-right sticky right-0 z-10 transition-colors shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)] dark:shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.35)] ${
      isSelected
        ? "bg-zinc-200 dark:bg-zinc-800"
        : "bg-white dark:bg-[#18181b] group-hover:bg-[#f4f4f5] dark:group-hover:bg-[#27272a]"
    }`}
  >
    <div className="inline-flex items-center justify-end gap-1">
      <button
        type="button"
        id={`view-details-${item.id}`}
        onClick={() => onViewDetails(item)}
        className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] rounded-lg transition-colors cursor-pointer"
        title="View Details"
        aria-label={`View details for ${item.app_name}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        id={`edit-key-${item.id}`}
        onClick={() => onEdit(item)}
        className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] rounded-lg transition-colors cursor-pointer"
        title="Edit Key"
        aria-label={`Edit key for ${item.app_name}`}
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        id={`clone-key-${item.id}`}
        onClick={() => onClone(item.id)}
        className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] rounded-lg transition-colors cursor-pointer hidden sm:inline-flex"
        title="Duplicate / Clone"
        aria-label={`Duplicate key for ${item.app_name}`}
      >
        <CopyPlus className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        id={`delete-key-${item.id}`}
        onClick={() => onDelete(item.id, item.app_name)}
        className="p-1.5 text-[#71717a] hover:text-rose-600 dark:text-[#a1a1aa] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
        title="Delete Key"
        aria-label={`Delete key for ${item.app_name}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </td>
);

interface KeyTableRowProps {
  item: ApiKeyItem;
  isSelected: boolean;
  activeColumns: ColumnKey[];
  cellProps: Omit<KeyTableCellProps, "item" | "colKey">;
  onToggleSelect: (id: number) => void;
  onViewDetails: (item: ApiKeyItem) => void;
  onEdit: (item: ApiKeyItem) => void;
  onClone: (id: number) => void;
  onDelete: (id: number, appName: string) => void;
}

const KeyTableRow: React.FC<KeyTableRowProps> = ({
  item,
  isSelected,
  activeColumns,
  cellProps,
  onToggleSelect,
  onViewDetails,
  onEdit,
  onClone,
  onDelete,
}) => (
  <tr
    id={`key-row-${item.id}`}
    className={`group transition-colors ${
      isSelected
        ? "bg-zinc-200/60 dark:bg-zinc-800/60"
        : "hover:bg-[#f4f4f5]/60 dark:hover:bg-[#27272a]/40"
    }`}
  >
    <td className="py-3 px-3.5 text-center">
      <input
        type="checkbox"
        id={`select-key-${item.id}`}
        checked={isSelected}
        onChange={() => onToggleSelect(item.id)}
        className="rounded border-[#d4d4d8] dark:border-[#3f3f46] text-[#09090b] dark:text-[#f4f4f5] focus:ring-[#71717a] cursor-pointer"
      />
    </td>

    {activeColumns.map((colKey) => (
      <KeyTableCell
        key={colKey}
        item={item}
        colKey={colKey}
        {...cellProps}
      />
    ))}

    <RowActionsCell
      item={item}
      isSelected={isSelected}
      onViewDetails={onViewDetails}
      onEdit={onEdit}
      onClone={onClone}
      onDelete={onDelete}
    />
  </tr>
);

// --- Main KeyTable Component ---

interface KeyTableProps {
  keys: ApiKeyItem[];
  visibility: FieldVisibilitySettings;
  columnOrder?: ColumnKey[];
  onReorderColumns?: (newOrder: ColumnKey[]) => void;
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
  columnOrder = DEFAULT_COLUMN_ORDER,
  onReorderColumns,
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
    void navigator.clipboard.writeText(orgId);
    setCopiedOrgId(id);
    setTimeout(() => setCopiedOrgId(null), 2000);
    onCopyKey(orgId, `${appName} (Org ID)`);
  };

  const handleCopyClient = (clientId: string, appName: string, id: number) => {
    void navigator.clipboard.writeText(clientId);
    setCopiedClientId(id);
    setTimeout(() => setCopiedClientId(null), 2000);
    onCopyKey(clientId, `${appName} (Client ID)`);
  };

  const allSelected = keys.length > 0 && selectedIds.length === keys.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < keys.length;

  const activeColumns = columnOrder.filter((col) => {
    if (col === "app_name" || col === "key_value") return true;
    return visibility[col as OptionalFieldKey];
  });

  return (
    <div className="w-full bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table id="api-keys-table" className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f4f4f5] dark:bg-[#27272a]/70 border-b border-[#e4e4e7] dark:border-[#27272a] text-[#71717a] dark:text-[#a1a1aa] font-semibold select-none">
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

              {activeColumns.map((colKey) => (
                <HeaderCell
                  key={colKey}
                  colKey={colKey}
                  columnOrder={columnOrder}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={onSortChange}
                  onReorderColumns={onReorderColumns}
                />
              ))}

              <th className="py-3 px-4 text-right sticky right-0 z-20 bg-[#f4f4f5] dark:bg-[#27272a] shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)] dark:shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.35)] min-w-[130px]">
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#f4f4f5] dark:divide-[#27272a] text-xs">
            {keys.length === 0 ? (
              <tr>
                <td
                  colSpan={activeColumns.length + 2}
                  className="py-12 text-center text-[#71717a] dark:text-[#a1a1aa]"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Shield className="w-8 h-8 opacity-40 text-[#71717a]" />
                    <p className="text-sm font-medium font-sans">No API Keys found</p>
                    <p className="text-xs font-sans">
                      Adjust your search/filters or register a new API key.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              keys.map((item) => (
                <KeyTableRow
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.includes(item.id)}
                  activeColumns={activeColumns}
                  cellProps={{
                    isRevealed: !!revealedKeys[item.id],
                    isCopied: copiedId === item.id,
                    isOrgRevealed: !!revealedOrgIds[item.id],
                    isOrgCopied: copiedOrgId === item.id,
                    isClientRevealed: !!revealedClientIds[item.id],
                    isClientCopied: copiedClientId === item.id,
                    visibility,
                    onToggleReveal,
                    onCopyKey,
                    toggleOrgReveal,
                    handleCopyOrg,
                    toggleClientReveal,
                    handleCopyClient,
                    onViewDetails,
                    onTouch,
                  }}
                  onToggleSelect={onToggleSelect}
                  onViewDetails={onViewDetails}
                  onEdit={onEdit}
                  onClone={onClone}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
