import React, { useState, useRef } from "react";
import {
  FieldVisibilitySettings,
  OptionalFieldKey,
  ColumnKey,
  ApiKeyItem,
} from "../types";
import {
  FIELD_CONFIGS,
  VISIBILITY_PRESETS,
  DEFAULT_COLUMN_ORDER,
  DEFAULT_ENVIRONMENTS,
} from "../constants/fieldConfig";
import { EnvironmentBadge } from "./EnvironmentBadge";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  Database,
  Lock,
  Check,
  Sparkles,
  RotateCcw,
  X,
  Info,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  AlertTriangle,
  GripVertical,
  CheckCircle2,
} from "lucide-react";

export type SettingsTab = "display" | "columns" | "environments" | "backup";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  visibility: FieldVisibilitySettings;
  onToggleField: (key: OptionalFieldKey) => void;
  onApplyPreset: (presetKey: string) => void;
  onResetVisibility: () => void;
  columnOrder: ColumnKey[];
  onReorderColumns: (newOrder: ColumnKey[]) => void;
  onResetColumnOrder: () => void;
  environments: string[];
  onAddEnvironment: (name: string) => void;
  onUpdateEnvironment: (oldName: string, newName: string) => void;
  onDeleteEnvironment: (name: string) => void;
  onResetEnvironments: () => void;
  onImportJson: (items: any[], mode: "merge" | "replace") => Promise<void>;
  totalKeys: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = "display",
  visibility,
  onToggleField,
  onApplyPreset,
  onResetVisibility,
  columnOrder,
  onReorderColumns,
  onResetColumnOrder,
  environments,
  onAddEnvironment,
  onUpdateEnvironment,
  onDeleteEnvironment,
  onResetEnvironments,
  onImportJson,
  totalKeys,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [newEnvName, setNewEnvName] = useState("");
  const [editingEnv, setEditingEnv] = useState<{ oldName: string; newName: string } | null>(null);
  const [envError, setEnvError] = useState<string | null>(null);

  // Backup & Restore State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<any[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [importLoading, setImportLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop state for columns
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const categories = ["General", "Security & Access", "Dates & Lifecycle", "Contact & Notes"] as const;
  const totalOptional = FIELD_CONFIGS.length;
  const activeOptionalCount = Object.values(visibility).filter(Boolean).length;

  const getColumnLabel = (key: ColumnKey): string => {
    if (key === "app_name") return "App Name";
    if (key === "key_value") return "API Key / Token";
    const found = FIELD_CONFIGS.find((f) => f.key === key);
    return found ? found.label : key;
  };

  const moveColumn = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columnOrder.length) return;
    const newOrder = [...columnOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    onReorderColumns(newOrder);
  };

  // Drag-and-drop column handler
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newOrder = [...columnOrder];
    const [dragged] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, dragged);
    setDraggedIndex(index);
    onReorderColumns(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Environment operations
  const handleCreateEnv = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEnvName.trim();
    if (!clean) return;
    if (environments.some((env) => env.toLowerCase() === clean.toLowerCase())) {
      setEnvError(`Environment "${clean}" already exists.`);
      return;
    }
    onAddEnvironment(clean);
    setNewEnvName("");
    setEnvError(null);
  };

  const handleSaveEditedEnv = () => {
    if (!editingEnv) return;
    const clean = editingEnv.newName.trim();
    if (!clean) {
      setEnvError("Environment name cannot be empty.");
      return;
    }
    if (
      clean.toLowerCase() !== editingEnv.oldName.toLowerCase() &&
      environments.some((env) => env.toLowerCase() === clean.toLowerCase())
    ) {
      setEnvError(`Environment "${clean}" already exists.`);
      return;
    }
    onUpdateEnvironment(editingEnv.oldName, clean);
    setEditingEnv(null);
    setEnvError(null);
  };

  // Backup & Import
  const handleFileChange = (file: File) => {
    setImportFile(file);
    setParseError(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        const items = Array.isArray(data) ? data : data.items || data.keys;

        if (!Array.isArray(items)) {
          throw new Error("JSON must contain an array of API key objects.");
        }

        const validItems = items.filter((k) => k.app_name && k.key_value);
        if (validItems.length === 0) {
          throw new Error("No valid keys with 'app_name' and 'key_value' found in the JSON file.");
        }

        setParsedItems(validItems);
      } catch (err: any) {
        setParseError(err.message || "Failed to parse JSON file.");
        setParsedItems(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsedItems || parsedItems.length === 0) return;
    setImportLoading(true);
    setParseError(null);
    try {
      await onImportJson(parsedItems, importMode);
      setSuccessMsg(`Successfully restored ${parsedItems.length} keys (${importMode} mode)!`);
      setTimeout(() => {
        setSuccessMsg(null);
        setParsedItems(null);
        setImportFile(null);
      }, 2000);
    } catch (err: any) {
      setParseError(err.message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="settings-modal"
        className="bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e4e4e7] dark:border-[#27272a] flex items-center justify-between bg-[#f4f4f5] dark:bg-[#27272a]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-[#09090b] dark:text-[#f4f4f5] border border-[#e4e4e7] dark:border-[#3f3f46]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#09090b] dark:text-[#f4f4f5]">
                Settings & Preferences
              </h2>
              <p className="text-xs text-[#71717a] dark:text-[#a1a1aa]">
                Customize display fields, table columns, environments, and backups
              </p>
            </div>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] rounded-lg hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e4e4e7] dark:border-[#27272a] bg-[#fafafa] dark:bg-[#1c1c1f] px-6 gap-2 overflow-x-auto">
          <button
            id="tab-display-btn"
            onClick={() => setActiveTab("display")}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "display"
                ? "border-[#09090b] dark:border-[#f4f4f5] text-[#09090b] dark:text-[#f4f4f5]"
                : "border-transparent text-[#71717a] dark:text-[#a1a1aa] hover:text-[#09090b] dark:hover:text-[#f4f4f5]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Display & Fields</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {activeOptionalCount + 2}
            </span>
          </button>

          <button
            id="tab-columns-btn"
            onClick={() => setActiveTab("columns")}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "columns"
                ? "border-[#09090b] dark:border-[#f4f4f5] text-[#09090b] dark:text-[#f4f4f5]"
                : "border-transparent text-[#71717a] dark:text-[#a1a1aa] hover:text-[#09090b] dark:hover:text-[#f4f4f5]"
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Table Columns</span>
          </button>

          <button
            id="tab-environments-btn"
            onClick={() => setActiveTab("environments")}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "environments"
                ? "border-[#09090b] dark:border-[#f4f4f5] text-[#09090b] dark:text-[#f4f4f5]"
                : "border-transparent text-[#71717a] dark:text-[#a1a1aa] hover:text-[#09090b] dark:hover:text-[#f4f4f5]"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Environments</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {environments.length}
            </span>
          </button>

          <button
            id="tab-backup-btn"
            onClick={() => setActiveTab("backup")}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "backup"
                ? "border-[#09090b] dark:border-[#f4f4f5] text-[#09090b] dark:text-[#f4f4f5]"
                : "border-transparent text-[#71717a] dark:text-[#a1a1aa] hover:text-[#09090b] dark:hover:text-[#f4f4f5]"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backup & Restore</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: DISPLAY & FIELDS */}
          {activeTab === "display" && (
            <div className="space-y-6">
              {/* Information Callout */}
              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-[#09090b] dark:text-[#f4f4f5] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-zinc-600 dark:text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#09090b] dark:text-[#f4f4f5]">Dynamic Field Visibility Engine</p>
                  <p className="text-[#71717a] dark:text-[#a1a1aa] mt-0.5 leading-relaxed">
                    Toggled off fields are hidden from both the table/cards and the Add/Edit form modals.
                    All data in SQLite remains securely preserved.
                  </p>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                    Quick Visibility Presets
                  </span>
                  <button
                    id="reset-visibility-btn"
                    onClick={onResetVisibility}
                    className="text-xs text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Defaults
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(VISIBILITY_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      id={`preset-${key}`}
                      onClick={() => onApplyPreset(key)}
                      className="p-2.5 text-left rounded-xl border border-[#e4e4e7] dark:border-[#27272a] hover:border-zinc-500 dark:hover:border-zinc-500 bg-[#f4f4f5]/50 dark:bg-[#27272a]/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-medium text-[#09090b] dark:text-[#f4f4f5] group-hover:text-black dark:group-hover:text-white">
                        {preset.label}
                      </div>
                      <div className="text-[10px] text-[#71717a] dark:text-[#a1a1aa] line-clamp-1 mt-0.5">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Identity (Always Visible) */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] block mb-2.5">
                  Core Identity (Always Visible)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5]/70 dark:bg-[#27272a]/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#e4e4e7] dark:bg-[#3f3f46] text-[#52525b] dark:text-[#a1a1aa]">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-[#09090b] dark:text-[#f4f4f5]">App Name</div>
                        <div className="text-[11px] text-[#71717a] dark:text-[#a1a1aa]">Service or application identifier</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#e4e4e7] dark:bg-[#3f3f46] text-[#52525b] dark:text-[#a1a1aa]">
                      Required
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5]/70 dark:bg-[#27272a]/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#e4e4e7] dark:bg-[#3f3f46] text-[#52525b] dark:text-[#a1a1aa]">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-[#09090b] dark:text-[#f4f4f5]">Key Value</div>
                        <div className="text-[11px] text-[#71717a] dark:text-[#a1a1aa]">Secret token string (masked)</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#e4e4e7] dark:bg-[#3f3f46] text-[#52525b] dark:text-[#a1a1aa]">
                      Required
                    </span>
                  </div>
                </div>
              </div>

              {/* Categorized Toggle Switches */}
              {categories.map((category) => {
                const fieldsInCategory = FIELD_CONFIGS.filter((f) => f.category === category);
                if (fieldsInCategory.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] block">
                      {category}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {fieldsInCategory.map((field) => {
                        const isVisible = visibility[field.key];
                        return (
                          <div
                            key={field.key}
                            onClick={() => onToggleField(field.key)}
                            id={`toggle-field-wrapper-${field.key}`}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                              isVisible
                                ? "bg-white dark:bg-[#27272a] border-zinc-400 dark:border-zinc-600 shadow-xs"
                                : "bg-[#f4f4f5]/40 dark:bg-[#18181b]/60 border-[#e4e4e7] dark:border-[#27272a] opacity-60 hover:opacity-80"
                            }`}
                          >
                            <div className="pr-2">
                              <div className="text-xs font-medium text-[#09090b] dark:text-[#f4f4f5] flex items-center gap-1.5">
                                <span>{field.label}</span>
                                {isVisible && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                              </div>
                              <div className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] line-clamp-1 mt-0.5">
                                {field.description}
                              </div>
                            </div>

                            <button
                              type="button"
                              role="switch"
                              aria-checked={isVisible}
                              id={`toggle-switch-${field.key}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleField(field.key);
                              }}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                isVisible ? "bg-[#09090b] dark:bg-[#f4f4f5]" : "bg-zinc-300 dark:bg-zinc-700"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-[#09090b] shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  isVisible ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: TABLE COLUMNS REARRANGEMENT */}
          {activeTab === "columns" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa]">
                    Column Order in Table View
                  </h3>
                  <p className="text-xs text-[#71717a] dark:text-[#a1a1aa] mt-0.5">
                    Drag and drop or use the arrow buttons to rearrange table columns.
                  </p>
                </div>
                <button
                  id="reset-column-order-btn"
                  onClick={onResetColumnOrder}
                  className="text-xs text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Order
                </button>
              </div>

              <div className="space-y-1.5 border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2 bg-[#f4f4f5]/30 dark:bg-[#18181b]/30">
                {columnOrder.map((colKey, index) => {
                  const isVisible =
                    colKey === "app_name" || colKey === "key_value"
                      ? true
                      : visibility[colKey as OptionalFieldKey];

                  return (
                    <div
                      key={colKey}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between p-2.5 px-3 rounded-lg border transition-all ${
                        draggedIndex === index
                          ? "bg-zinc-200 dark:bg-zinc-800 border-zinc-400"
                          : "bg-white dark:bg-[#27272a] border-[#e4e4e7] dark:border-[#3f3f46] hover:border-zinc-400"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <GripVertical className="w-4 h-4 text-zinc-400 cursor-grab active:cursor-grabbing shrink-0" />
                        <span className="w-5 text-center text-[10px] font-mono text-[#71717a] dark:text-[#a1a1aa]">
                          {index + 1}
                        </span>
                        <div>
                          <span className="text-xs font-medium text-[#09090b] dark:text-[#f4f4f5]">
                            {getColumnLabel(colKey)}
                          </span>
                          {!isVisible && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-sans">
                              Hidden in Display
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveColumn(index, "up")}
                          className="p-1 rounded text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#3f3f46] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Move column left / up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === columnOrder.length - 1}
                          onClick={() => moveColumn(index, "down")}
                          className="p-1 rounded text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#3f3f46] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Move column right / down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ENVIRONMENT LABELS (ADD / MODIFY / DELETE) */}
          {activeTab === "environments" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa]">
                    Environment Labels Management
                  </h3>
                  <p className="text-xs text-[#71717a] dark:text-[#a1a1aa] mt-0.5">
                    Add new environments, rename labels, or remove labels no longer in use.
                  </p>
                </div>
                <button
                  id="reset-environments-btn"
                  onClick={onResetEnvironments}
                  className="text-xs text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Defaults
                </button>
              </div>

              {envError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
                  <span>{envError}</span>
                  <button onClick={() => setEnvError(null)} className="text-xs underline cursor-pointer">
                    Dismiss
                  </button>
                </div>
              )}

              {/* Add New Environment Form */}
              <form onSubmit={handleCreateEnv} className="flex gap-2">
                <input
                  type="text"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  placeholder="New environment label (e.g., Sandbox, QA, Edge-Lab)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] text-xs focus:outline-hidden focus:ring-2 focus:ring-zinc-400 placeholder:text-zinc-400"
                />
                <button
                  type="submit"
                  disabled={!newEnvName.trim()}
                  className="px-4 py-2 rounded-xl bg-[#09090b] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:text-[#09090b] dark:hover:bg-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Label</span>
                </button>
              </form>

              {/* Existing Environment List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {environments.map((env) => {
                  const isEditing = editingEnv?.oldName === env;

                  return (
                    <div
                      key={env}
                      className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-white dark:bg-[#27272a] flex items-center justify-between gap-2 shadow-xs"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editingEnv.newName}
                            onChange={(e) => setEditingEnv({ ...editingEnv, newName: e.target.value })}
                            className="w-full px-2.5 py-1 rounded-lg border border-zinc-400 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleSaveEditedEnv}
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                            title="Save Rename"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingEnv(null)}
                            className="p-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5 truncate">
                            <EnvironmentBadge environment={env} size="md" />
                            <span className="text-xs font-medium text-[#09090b] dark:text-[#f4f4f5] truncate">
                              {env}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditingEnv({ oldName: env, newName: env })}
                              className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#3f3f46] rounded-lg transition-colors cursor-pointer"
                              title="Rename Environment"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteEnvironment(env)}
                              disabled={environments.length <= 1}
                              className="p-1.5 text-[#71717a] hover:text-red-600 dark:text-[#a1a1aa] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Delete Environment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & RESTORE */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              {/* Export Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                  Export SQLite Database ({totalKeys} keys)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <a
                    id="export-json-btn"
                    href="/api/export/json"
                    download
                    className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] hover:border-zinc-500 bg-[#f4f4f5]/50 dark:bg-[#27272a]/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-all flex flex-col items-center text-center gap-1.5 group cursor-pointer"
                  >
                    <FileJson className="w-6 h-6 text-amber-500" />
                    <div>
                      <span className="text-xs font-semibold text-[#09090b] dark:text-[#f4f4f5] block">
                        JSON Backup
                      </span>
                      <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">
                        Full schema & values
                      </span>
                    </div>
                  </a>

                  <a
                    id="export-csv-btn"
                    href="/api/export/csv"
                    download
                    className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] hover:border-zinc-500 bg-[#f4f4f5]/50 dark:bg-[#27272a]/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-all flex flex-col items-center text-center gap-1.5 group cursor-pointer"
                  >
                    <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
                    <div>
                      <span className="text-xs font-semibold text-[#09090b] dark:text-[#f4f4f5] block">
                        CSV Spreadsheet
                      </span>
                      <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">
                        Spreadsheet / Excel
                      </span>
                    </div>
                  </a>

                  <a
                    id="export-db-btn"
                    href="/api/export/db"
                    download
                    className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] hover:border-zinc-500 bg-[#f4f4f5]/50 dark:bg-[#27272a]/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-all flex flex-col items-center text-center gap-1.5 group cursor-pointer"
                  >
                    <Database className="w-6 h-6 text-blue-500" />
                    <div>
                      <span className="text-xs font-semibold text-[#09090b] dark:text-[#f4f4f5] block">
                        Raw SQLite File
                      </span>
                      <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">
                        .sqlite binary
                      </span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Import / Restore Section */}
              <div className="space-y-3 pt-4 border-t border-[#e4e4e7] dark:border-[#27272a]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                  Restore / Import JSON
                </h3>

                {parseError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{parseError}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#e4e4e7] dark:border-[#3f3f46] hover:border-zinc-500 dark:hover:border-zinc-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#f4f4f5]/30 dark:bg-[#18181b]/30 flex flex-col items-center justify-center gap-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-zinc-400" />
                  <div className="text-xs font-medium text-[#09090b] dark:text-[#f4f4f5]">
                    {importFile ? importFile.name : "Click to browse or drop backup JSON file"}
                  </div>
                  <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">
                    Accepts export files from Keyling (.json)
                  </span>
                </div>

                {parsedItems && (
                  <div className="p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#f4f4f5]/80 dark:bg-[#27272a]/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        Parsed {parsedItems.length} keys ready to restore
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#52525b] dark:text-[#a1a1aa] block">
                        Import Strategy:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setImportMode("merge")}
                          className={`p-2 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                            importMode === "merge"
                              ? "bg-white dark:bg-[#18181b] border-zinc-600 dark:border-zinc-400 text-[#09090b] dark:text-[#f4f4f5] shadow-xs"
                              : "bg-[#f4f4f5] dark:bg-[#27272a] border-[#e4e4e7] dark:border-[#3f3f46] text-[#71717a]"
                          }`}
                        >
                          <div className="font-semibold">Merge (Append)</div>
                          <div className="text-[10px] opacity-80">Keep current keys and add new ones</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImportMode("replace")}
                          className={`p-2 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                            importMode === "replace"
                              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs"
                              : "bg-[#f4f4f5] dark:bg-[#27272a] border-[#e4e4e7] dark:border-[#3f3f46] text-[#71717a]"
                          }`}
                        >
                          <div className="font-semibold">Replace All</div>
                          <div className="text-[10px] opacity-80">Wipes current DB and restores exactly</div>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={importLoading}
                      onClick={handleImport}
                      className="w-full py-2.5 rounded-xl bg-[#09090b] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:text-[#09090b] dark:hover:bg-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {importLoading ? (
                        <span>Restoring...</span>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Execute {importMode === "replace" ? "Replace & Restore" : "Merge Import"}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] flex items-center justify-end">
          <button
            id="done-settings-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#09090b] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:text-[#09090b] dark:hover:bg-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
