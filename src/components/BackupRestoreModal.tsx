import React, { useState, useRef } from "react";
import { Download, Upload, Database, FileJson, FileSpreadsheet, AlertTriangle, CheckCircle2, X } from "lucide-react";

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportJson: (items: any[], mode: "merge" | "replace") => Promise<void>;
  totalKeys: number;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onImportJson,
  totalKeys,
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<any[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
    setLoading(true);
    setParseError(null);
    try {
      await onImportJson(parsedItems, importMode);
      setSuccessMsg(`Successfully restored ${parsedItems.length} keys (${importMode} mode)!`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
        setParsedItems(null);
        setImportFile(null);
      }, 1200);
    } catch (err: any) {
      setParseError(err.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="backup-restore-modal"
        className="bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e4e4e7] dark:border-[#27272a] flex items-center justify-between bg-[#f4f4f5] dark:bg-[#27272a]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-[#09090b] dark:text-[#f4f4f5] border border-[#e4e4e7] dark:border-[#3f3f46]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#09090b] dark:text-[#f4f4f5]">
                Backup & Restore Registry
              </h2>
              <p className="text-xs text-[#71717a] dark:text-[#a1a1aa]">
                Export SQLite data as JSON/CSV/DB or restore from backup
              </p>
            </div>
          </div>
          <button
            id="close-backup-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] rounded-lg hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
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
                <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-[#09090b] dark:text-[#f4f4f5]">
                  <FileJson className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#09090b] dark:text-[#f4f4f5] group-hover:text-black dark:group-hover:text-white">
                  JSON Export
                </span>
                <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">
                  Full schema format
                </span>
              </a>

              <a
                id="export-csv-btn"
                href="/api/export/csv"
                download
                className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] hover:border-zinc-500 bg-[#f4f4f5]/50 dark:bg-[#27272a]/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-all flex flex-col items-center text-center gap-1.5 group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-[#09090b] dark:text-[#f4f4f5]">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#09090b] dark:text-[#f4f4f5] group-hover:text-black dark:group-hover:text-white">
                  CSV Export
                </span>
                <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">
                  Spreadsheet friendly
                </span>
              </a>

              <a
                id="export-sqlite-btn"
                href="/api/export/sqlite"
                download
                className="p-3 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] hover:border-zinc-500 bg-[#f4f4f5]/50 dark:bg-[#27272a]/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-all flex flex-col items-center text-center gap-1.5 group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-[#09090b] dark:text-[#f4f4f5]">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#09090b] dark:text-[#f4f4f5] group-hover:text-black dark:group-hover:text-white">
                  Raw SQLite
                </span>
                <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">
                  Binary .sqlite file
                </span>
              </a>
            </div>
          </div>

          <div className="border-t border-[#e4e4e7] dark:border-[#27272a]" />

          {/* Import / Restore Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              Restore from JSON Backup
            </h3>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-[#e4e4e7] dark:border-[#27272a] hover:border-zinc-400 dark:hover:border-zinc-600 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-[#f4f4f5]/50 dark:bg-[#27272a]/40"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <FileJson className="w-8 h-8 text-[#71717a] dark:text-[#a1a1aa] mx-auto mb-2" />
              <p className="text-xs font-medium text-[#09090b] dark:text-[#f4f4f5]">
                {importFile ? importFile.name : "Click or drag & drop backup JSON here"}
              </p>
              <p className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] mt-0.5">
                Supports homelab JSON export array format
              </p>
            </div>

            {parseError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {parsedItems && (
              <div className="space-y-3 p-3.5 rounded-xl bg-[#f4f4f5]/70 dark:bg-[#27272a]/70 border border-[#e4e4e7] dark:border-[#27272a] animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#09090b] dark:text-[#f4f4f5]">
                    Ready to restore {parsedItems.length} keys
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Valid JSON
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-[#71717a] dark:text-[#a1a1aa] uppercase tracking-wider block">
                    Restore Strategy
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setImportMode("merge")}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        importMode === "merge"
                          ? "border-zinc-500 bg-zinc-200 dark:bg-zinc-800 text-[#09090b] dark:text-[#f4f4f5] font-medium"
                          : "border-[#e4e4e7] dark:border-[#27272a] text-[#71717a] dark:text-[#a1a1aa]"
                      }`}
                    >
                      <div className="font-medium">Merge / Append</div>
                      <div className="text-[10px] opacity-75">Keep existing keys and add new ones</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImportMode("replace")}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        importMode === "replace"
                          ? "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-medium"
                          : "border-[#e4e4e7] dark:border-[#27272a] text-[#71717a] dark:text-[#a1a1aa]"
                      }`}
                    >
                      <div className="font-medium text-red-600 dark:text-red-400">Replace Database</div>
                      <div className="text-[10px] opacity-75">Wipe current table and restore</div>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  id="confirm-import-btn"
                  disabled={loading}
                  onClick={handleImport}
                  className="w-full py-2.5 rounded-xl bg-[#09090b] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:text-[#09090b] dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{loading ? "Importing..." : `Execute ${importMode.toUpperCase()} Import`}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] flex items-center justify-end">
          <button
            id="close-backup-footer-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#e4e4e7] dark:bg-[#27272a] text-[#52525b] dark:text-[#a1a1aa] hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
