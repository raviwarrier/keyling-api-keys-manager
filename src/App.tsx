/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ApiKeyItem, AppStats, FieldVisibilitySettings, OptionalFieldKey, ColumnKey } from "./types";
import {
  DEFAULT_FIELD_VISIBILITY,
  VISIBILITY_PRESETS,
  DEFAULT_COLUMN_ORDER,
  DEFAULT_ENVIRONMENTS,
} from "./constants/fieldConfig";
import { Navbar } from "./components/Navbar";
import { StatsOverview } from "./components/StatsOverview";
import { KeyTable } from "./components/KeyTable";
import { KeyCards } from "./components/KeyCards";
import { KeyModal } from "./components/KeyModal";
import { SettingsModal, SettingsTab } from "./components/SettingsModal";
import { KeyDetailsModal } from "./components/KeyDetailsModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { SecretGeneratorModal } from "./components/SecretGeneratorModal";
import { ToastContainer, ToastMessage } from "./components/Toast";
import {
  Trash2,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Download,
  SlidersHorizontal,
  RefreshCw,
  Plus,
  Server,
  Layers,
} from "lucide-react";

// Helper to safely parse various date string representations for expiry calculations
const parseExpiryDate = (dateStr?: string | null): Date | null => {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T23:59:59`);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
};

export default function App() {
  // Theme State (Dark mode default)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("homelab_keys_theme");
    if (saved !== null) {
      return saved === "dark";
    }
    return true; // Default dark mode as requested
  });

  // Display Settings / Field Visibility State (Persisted in localStorage)
  const [visibility, setVisibility] = useState<FieldVisibilitySettings>(() => {
    try {
      const saved = localStorage.getItem("homelab_keys_field_visibility");
      if (saved) {
        return { ...DEFAULT_FIELD_VISIBILITY, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to load visibility settings from localStorage:", e);
    }
    return DEFAULT_FIELD_VISIBILITY;
  });

  // Table Column Order State (Persisted in localStorage)
  const [columnOrder, setColumnOrder] = useState<ColumnKey[]>(() => {
    try {
      const saved = localStorage.getItem("homelab_keys_column_order");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure all DEFAULT_COLUMN_ORDER items exist in columnOrder
          const combined = [...parsed];
          DEFAULT_COLUMN_ORDER.forEach((col) => {
            if (!combined.includes(col)) combined.push(col);
          });
          return combined;
        }
      }
    } catch (e) {
      console.warn("Failed to load column order from localStorage:", e);
    }
    return DEFAULT_COLUMN_ORDER;
  });

  // Dynamic Environment Labels (Persisted in localStorage)
  const [environments, setEnvironments] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("homelab_keys_custom_environments");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load environments from localStorage:", e);
    }
    return DEFAULT_ENVIRONMENTS;
  });

  // Data State
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [search, setSearch] = useState<string>("");
  const [environmentFilter, setEnvironmentFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Selection & Revealing State
  const [revealedKeys, setRevealedKeys] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyItem | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>("display");
  const [isSecretGeneratorOpen, setIsSecretGeneratorOpen] = useState(false);
  const [detailsKey, setDetailsKey] = useState<ApiKeyItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    ids: number[];
    title: string;
    description: string;
  }>({
    isOpen: false,
    ids: [],
    title: "",
    description: "",
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const hasCheckedExpiringOnInit = useRef<boolean>(false);

  const addToast = (
    type: "success" | "error" | "info" | "warning",
    title: string,
    message?: string,
    duration = 3500
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Automated toast notification on app initialization for keys expiring in next 48 hours
  useEffect(() => {
    const checkExpiringKeysOnInit = async () => {
      if (hasCheckedExpiringOnInit.current) return;
      hasCheckedExpiringOnInit.current = true;

      try {
        const res = await fetch("/api/keys");
        if (!res.ok) return;
        const allKeys: ApiKeyItem[] = await res.json();

        const now = new Date();
        const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        const expiringSoon = allKeys.filter((k) => {
          if (!k.expiry_date || k.status === "Revoked") return false;
          const exp = parseExpiryDate(k.expiry_date);
          return exp !== null && exp >= now && exp <= in48Hours;
        });

        if (expiringSoon.length > 0) {
          if (expiringSoon.length === 1) {
            const key = expiringSoon[0];
            const exp = parseExpiryDate(key.expiry_date)!;
            const diffMs = exp.getTime() - now.getTime();
            const hoursRemaining = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
            addToast(
              "warning",
              "Key Expiring Soon",
              `"${key.app_name}" expires in ~${hoursRemaining} hour${hoursRemaining === 1 ? "" : "s"} (${exp.toLocaleDateString()}). Please renew or rotate.`,
              7000
            );
          } else {
            const names = expiringSoon.map((k) => k.app_name);
            const nameList = names.slice(0, 3).join(", ");
            const extra = names.length > 3 ? ` and ${names.length - 3} more` : "";
            addToast(
              "warning",
              "Keys Expiring Within 48 Hours",
              `${expiringSoon.length} keys are expiring within 48h: ${nameList}${extra}. Please review or rotate credentials.`,
              8000
            );
          }
        }
      } catch (e) {
        console.error("Failed to check expiring keys on initialization:", e);
      }
    };

    checkExpiringKeysOnInit();
  }, []);

  // Sync theme class to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("homelab_keys_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("homelab_keys_theme", "light");
    }
  }, [isDarkMode]);

  // Sync visibility to localStorage
  const handleToggleField = (key: OptionalFieldKey) => {
    setVisibility((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("homelab_keys_field_visibility", JSON.stringify(updated));
      return updated;
    });
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = VISIBILITY_PRESETS[presetKey];
    if (preset) {
      setVisibility(preset.settings);
      localStorage.setItem("homelab_keys_field_visibility", JSON.stringify(preset.settings));
      addToast("info", "Preset Applied", `Switched to '${preset.label}' visibility configuration.`);
    }
  };

  const handleResetVisibility = () => {
    setVisibility(DEFAULT_FIELD_VISIBILITY);
    localStorage.setItem("homelab_keys_field_visibility", JSON.stringify(DEFAULT_FIELD_VISIBILITY));
    addToast("info", "Settings Reset", "Restored default field visibility.");
  };

  // Column order operations
  const handleReorderColumns = (newOrder: ColumnKey[]) => {
    setColumnOrder(newOrder);
    localStorage.setItem("homelab_keys_column_order", JSON.stringify(newOrder));
  };

  const handleResetColumnOrder = () => {
    setColumnOrder(DEFAULT_COLUMN_ORDER);
    localStorage.setItem("homelab_keys_column_order", JSON.stringify(DEFAULT_COLUMN_ORDER));
    addToast("info", "Column Order Reset", "Restored default table column arrangement.");
  };

  // Environment operations
  const handleAddEnvironment = (name: string) => {
    const updated = [...environments, name];
    setEnvironments(updated);
    localStorage.setItem("homelab_keys_custom_environments", JSON.stringify(updated));
    addToast("success", "Environment Added", `Added environment label "${name}"`);
  };

  const handleUpdateEnvironment = async (oldName: string, newName: string) => {
    const updated = environments.map((e) => (e === oldName ? newName : e));
    setEnvironments(updated);
    localStorage.setItem("homelab_keys_custom_environments", JSON.stringify(updated));

    // Also update any keys that were using the old environment name in SQLite
    const keysWithOldEnv = keys.filter((k) => k.environment === oldName);
    if (keysWithOldEnv.length > 0) {
      try {
        for (const k of keysWithOldEnv) {
          await fetch(`/api/keys/${k.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ environment: newName }),
          });
        }
        fetchKeys();
        fetchStats();
      } catch (e) {
        console.error("Failed to migrate existing keys to renamed environment:", e);
      }
    }

    if (environmentFilter === oldName) {
      setEnvironmentFilter(newName);
    }

    addToast("success", "Environment Renamed", `Renamed "${oldName}" to "${newName}"`);
  };

  const handleDeleteEnvironment = (name: string) => {
    const updated = environments.filter((e) => e !== name);
    setEnvironments(updated);
    localStorage.setItem("homelab_keys_custom_environments", JSON.stringify(updated));
    if (environmentFilter === name) {
      setEnvironmentFilter("All");
    }
    addToast("info", "Environment Deleted", `Removed environment label "${name}"`);
  };

  const handleResetEnvironments = () => {
    setEnvironments(DEFAULT_ENVIRONMENTS);
    localStorage.setItem("homelab_keys_custom_environments", JSON.stringify(DEFAULT_ENVIRONMENTS));
    addToast("info", "Environments Reset", "Restored default environment labels list.");
  };

  // Fetch API Keys
  const fetchKeys = useCallback(async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (environmentFilter !== "All") params.append("environment", environmentFilter);
      if (statusFilter !== "All" && statusFilter !== "ExpiringSoon") {
        params.append("status", statusFilter);
      }
      params.append("sort_by", sortBy);
      params.append("sort_order", sortOrder);

      const res = await fetch(`/api/keys?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch keys");
      let data: ApiKeyItem[] = await res.json();

      // Client-side handling for "ExpiringSoon" filter
      if (statusFilter === "ExpiringSoon") {
        const now = new Date();
        const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        data = data.filter((k) => {
          if (!k.expiry_date || k.status === "Revoked") return false;
          const exp = new Date(k.expiry_date);
          return !isNaN(exp.getTime()) && exp >= now && exp <= sevenDays;
        });
      }

      setKeys(data);
    } catch (err: any) {
      console.error(err);
      addToast("error", "Network Error", "Could not fetch API keys from SQLite database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, environmentFilter, statusFilter, sortBy, sortOrder]);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data: AppStats = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Key operations
  const handleSaveKey = async (formData: Partial<ApiKeyItem>) => {
    if (editingKey) {
      const res = await fetch(`/api/keys/${editingKey.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update key");
      }
      addToast("success", "Key Updated", `Updated credentials for ${formData.app_name}`);
    } else {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create key");
      }
      addToast("success", "Key Registered", `Successfully registered ${formData.app_name}`);
    }
    fetchKeys();
    fetchStats();
  };

  const handleToggleReveal = (id: number) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyKey = (keyText: string, appName: string) => {
    navigator.clipboard.writeText(keyText);
    const item = keys.find((k) => k.key_value === keyText);
    if (item) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    addToast("success", "Copied to Clipboard", `Copied key for "${appName}"`);
  };

  const handleDeleteRequest = (id: number, appName: string) => {
    setDeleteConfirm({
      isOpen: true,
      ids: [id],
      title: `Delete "${appName}"?`,
      description: `This action will permanently remove this API key credential and its associated metadata from your SQLite homelab registry.`,
    });
  };

  const handleBulkDeleteRequest = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirm({
      isOpen: true,
      ids: selectedIds,
      title: `Delete ${selectedIds.length} API Keys?`,
      description: `Are you sure you want to delete ${selectedIds.length} selected key records? This action cannot be undone.`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteConfirm.ids.length === 1) {
        const res = await fetch(`/api/keys/${deleteConfirm.ids[0]}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete key");
        addToast("info", "Key Deleted", "The API key was removed from the registry.");
      } else {
        const res = await fetch("/api/keys/bulk", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: deleteConfirm.ids }),
        });
        if (!res.ok) throw new Error("Failed to delete selected keys");
        addToast("info", "Batch Deleted", `Removed ${deleteConfirm.ids.length} keys from the registry.`);
      }
      setSelectedIds((prev) => prev.filter((id) => !deleteConfirm.ids.includes(id)));
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      fetchKeys();
      fetchStats();
    } catch (err: any) {
      console.error(err);
      addToast("error", "Delete Failed", err.message || "Could not delete key");
    }
  };

  const handleClone = (id: number) => {
    const item = keys.find((k) => k.id === id);
    if (!item) return;
    const cloned: Partial<ApiKeyItem> = {
      ...item,
      app_name: `${item.app_name} (Copy)`,
      key_value: `${item.key_value}_copy`,
    };
    delete (cloned as any).id;
    setEditingKey(cloned as ApiKeyItem);
    setIsKeyModalOpen(true);
  };

  const handleTouch = async (id: number) => {
    try {
      const res = await fetch(`/api/keys/${id}/touch`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to update activity");
      addToast("success", "Activity Recorded", "Marked key as active right now.");
      fetchKeys();
      fetchStats();
    } catch (err: any) {
      console.error(err);
      addToast("error", "Error", "Could not record key usage");
    }
  };

  // Bulk Operations
  const handleBulkStatus = async (status: "Active" | "Revoked" | "Paused") => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/keys/bulk/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      addToast("success", "Status Updated", `Updated ${selectedIds.length} keys to ${status}`);
      setSelectedIds([]);
      fetchKeys();
      fetchStats();
    } catch (err: any) {
      console.error(err);
      addToast("error", "Error", "Failed to update bulk status");
    }
  };

  // Selection
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === keys.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(keys.map((k) => k.id));
    }
  };

  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  const handleImportJson = async (items: any[], mode: "merge" | "replace") => {
    const res = await fetch("/api/import/json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, mode }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to restore backup");
    }
    const data = await res.json();
    addToast(
      "success",
      "Backup Restored",
      `Successfully imported ${data.importedCount} keys into SQLite database.`
    );
    setSelectedIds([]);
    fetchKeys();
    fetchStats();
  };

  const openSettingsModal = (tab: SettingsTab = "display") => {
    setSettingsInitialTab(tab);
    setIsSettingsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#121214] text-[#09090b] dark:text-[#f4f4f5] flex flex-col font-sans transition-colors duration-150 selection:bg-zinc-300 dark:selection:bg-zinc-700">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header & Sticky Navigation Bar with Hamburger Menu */}
      <Navbar
        search={search}
        onSearchChange={setSearch}
        environmentFilter={environmentFilter}
        onEnvironmentChange={setEnvironmentFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenSettings={openSettingsModal}
        onOpenSecretGenerator={() => setIsSecretGeneratorOpen(true)}
        onOpenAddModal={() => {
          setEditingKey(null);
          setIsKeyModalOpen(true);
        }}
        environments={environments}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Metric Stats Cards & Environmental Pills */}
        <StatsOverview
          stats={stats}
          selectedStatus={statusFilter}
          onSelectStatus={setStatusFilter}
          selectedEnv={environmentFilter}
          onSelectEnv={setEnvironmentFilter}
        />

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div
            id="bulk-action-bar"
            className="p-3 px-4 bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[#09090b] dark:text-[#f4f4f5]">
                {selectedIds.length} Selected
              </span>
              <span className="text-xs text-[#71717a] dark:text-[#a1a1aa] hidden sm:inline">
                Bulk change status or delete records:
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleBulkStatus("Active")}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 text-xs font-medium border border-emerald-500/30 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Active</span>
              </button>
              <button
                onClick={() => handleBulkStatus("Paused")}
                className="px-2.5 py-1 rounded-lg bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-500/20 text-xs font-medium border border-zinc-500/30 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Mark Paused</span>
              </button>
              <button
                onClick={() => handleBulkStatus("Revoked")}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 text-xs font-medium border border-rose-500/30 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Mark Revoked</span>
              </button>
              <button
                onClick={handleBulkDeleteRequest}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer ml-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* View Header: Active filters indicator & Total match count */}
        <div className="flex items-center justify-between text-xs text-[#71717a] dark:text-[#a1a1aa] px-1">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-[#09090b] dark:text-[#f4f4f5]">{keys.length}</strong> keys
            </span>
            {(search || environmentFilter !== "All" || statusFilter !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setEnvironmentFilter("All");
                  setStatusFilter("All");
                }}
                className="text-[#09090b] dark:text-[#f4f4f5] hover:underline font-medium cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchKeys()}
              className="p-1 rounded text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] transition-colors flex items-center gap-1 cursor-pointer"
              title="Refresh table"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Primary View (Table or Responsive Card Grid) */}
        {loading ? (
          <div className="p-12 text-center text-[#71717a] dark:text-[#a1a1aa] bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#71717a]" />
            <p className="text-xs">Loading homelab registry...</p>
          </div>
        ) : viewMode === "table" ? (
          <div className="space-y-4">
            {/* Desktop Table with Custom Column Order & Sticky Actions */}
            <div className="hidden lg:block">
              <KeyTable
                keys={keys}
                visibility={visibility}
                columnOrder={columnOrder}
                onReorderColumns={handleReorderColumns}
                revealedKeys={revealedKeys}
                onToggleReveal={handleToggleReveal}
                onCopyKey={handleCopyKey}
                onEdit={(item) => {
                  setEditingKey(item);
                  setIsKeyModalOpen(true);
                }}
                onDelete={handleDeleteRequest}
                onClone={handleClone}
                onTouch={handleTouch}
                onViewDetails={(item) => setDetailsKey(item)}
                copiedId={copiedId}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
              />
            </div>
            {/* Mobile / Tablet Responsive Fallback */}
            <div className="lg:hidden">
              <KeyCards
                keys={keys}
                visibility={visibility}
                revealedKeys={revealedKeys}
                onToggleReveal={handleToggleReveal}
                onCopyKey={handleCopyKey}
                onEdit={(item) => {
                  setEditingKey(item);
                  setIsKeyModalOpen(true);
                }}
                onDelete={handleDeleteRequest}
                onClone={handleClone}
                onTouch={handleTouch}
                onViewDetails={(item) => setDetailsKey(item)}
                copiedId={copiedId}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
              />
            </div>
          </div>
        ) : (
          <KeyCards
            keys={keys}
            visibility={visibility}
            revealedKeys={revealedKeys}
            onToggleReveal={handleToggleReveal}
            onCopyKey={handleCopyKey}
            onEdit={(item) => {
              setEditingKey(item);
              setIsKeyModalOpen(true);
            }}
            onDelete={handleDeleteRequest}
            onClone={handleClone}
            onTouch={handleTouch}
            onViewDetails={(item) => setDetailsKey(item)}
            copiedId={copiedId}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <KeyModal
        isOpen={isKeyModalOpen}
        onClose={() => {
          setIsKeyModalOpen(false);
          setEditingKey(null);
        }}
        onSave={handleSaveKey}
        initialKey={editingKey}
        visibility={visibility}
        environments={environments}
        onOpenSettings={() => {
          setIsKeyModalOpen(false);
          openSettingsModal("display");
        }}
        onOpenSecretGenerator={() => setIsSecretGeneratorOpen(true)}
      />

      <SecretGeneratorModal
        isOpen={isSecretGeneratorOpen}
        onClose={() => setIsSecretGeneratorOpen(false)}
        onUseInNewKey={(secret) => {
          setEditingKey({ app_name: "", key_value: secret } as any);
          setIsKeyModalOpen(true);
        }}
        onSelectSecret={(secret) => {
          if (isKeyModalOpen) {
            setEditingKey((prev) =>
              prev ? { ...prev, key_value: secret } : ({ app_name: "", key_value: secret } as any)
            );
          }
        }}
      />

      {/* Unified Settings Modal (Display, Columns, Environments, Backup) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={settingsInitialTab}
        visibility={visibility}
        onToggleField={handleToggleField}
        onApplyPreset={handleApplyPreset}
        onResetVisibility={handleResetVisibility}
        columnOrder={columnOrder}
        onReorderColumns={handleReorderColumns}
        onResetColumnOrder={handleResetColumnOrder}
        environments={environments}
        onAddEnvironment={handleAddEnvironment}
        onUpdateEnvironment={handleUpdateEnvironment}
        onDeleteEnvironment={handleDeleteEnvironment}
        onResetEnvironments={handleResetEnvironments}
        onImportJson={handleImportJson}
        totalKeys={keys.length}
      />

      <KeyDetailsModal
        item={detailsKey}
        isOpen={!!detailsKey}
        onClose={() => setDetailsKey(null)}
        onEdit={(item) => {
          setEditingKey(item);
          setIsKeyModalOpen(true);
        }}
        onDelete={handleDeleteRequest}
        onTouch={handleTouch}
        onCopyKey={handleCopyKey}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title={deleteConfirm.title}
        description={deleteConfirm.description}
      />
    </div>
  );
}
