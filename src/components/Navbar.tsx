import React from "react";
import {
  Search,
  SlidersHorizontal,
  Database,
  Moon,
  Sun,
  Plus,
  LayoutGrid,
  List,
  Filter,
  X,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { KeylingLogo } from "./KeylingLogo";

interface NavbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  environmentFilter: string;
  onEnvironmentChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  viewMode: "table" | "cards";
  onViewModeChange: (mode: "table" | "cards") => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenBackup: () => void;
  onOpenSecretGenerator: () => void;
  onOpenAddModal: () => void;
  activeOptionalFieldsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  search,
  onSearchChange,
  environmentFilter,
  onEnvironmentChange,
  statusFilter,
  onStatusChange,
  viewMode,
  onViewModeChange,
  isDarkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenBackup,
  onOpenSecretGenerator,
  onOpenAddModal,
  activeOptionalFieldsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md border-b border-[#e4e4e7] dark:border-[#27272a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-3">
        {/* Top Tier: Logo, Database Status, Controls */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#18181b] dark:bg-[#27272a] text-[#f4f4f5] flex items-center justify-center shadow-xs shrink-0 border border-[#27272a] dark:border-[#3f3f46]">
              <KeylingLogo size={22} className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#09090b] dark:text-[#f4f4f5]">
                  Keyling
                </h1>
                <div
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f4f4f5] text-[#52525b] border border-[#e4e4e7] dark:bg-[#18181b] dark:text-[#a1a1aa] dark:border-[#27272a]"
                  title="SQLite persistent backend connected"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono">sqlite3</span>
                </div>
              </div>
              <p className="text-xs text-[#71717a] dark:text-[#a1a1aa] hidden sm:block">
                Secure management of api keys for homelabbers.
              </p>
            </div>
          </div>

          {/* Action Bar (Top Right) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Mode Toggle (Table / Card) */}
            <div className="hidden sm:flex items-center bg-[#f4f4f5] dark:bg-[#18181b] p-0.5 rounded-xl border border-[#e4e4e7] dark:border-[#27272a]">
              <button
                id="view-table-btn"
                onClick={() => onViewModeChange("table")}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === "table"
                    ? "bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] shadow-xs"
                    : "text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5]"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline text-[11px]">Table</span>
              </button>
              <button
                id="view-cards-btn"
                onClick={() => onViewModeChange("cards")}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === "cards"
                    ? "bg-white dark:bg-[#27272a] text-[#09090b] dark:text-[#f4f4f5] shadow-xs"
                    : "text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5]"
                }`}
                title="Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline text-[11px]">Cards</span>
              </button>
            </div>

            {/* Secret Generator Utility Trigger */}
            <button
              id="secret-generator-trigger-btn"
              onClick={onOpenSecretGenerator}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] text-[#52525b] dark:text-[#e4e4e7] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Secret & Token Generator (24, 36, 48, 64 chars Alphanumeric / Hex)"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">Secrets</span>
            </button>

            {/* Display Settings Trigger */}
            <button
              id="display-settings-trigger-btn"
              onClick={onOpenSettings}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] text-[#52525b] dark:text-[#e4e4e7] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Display Settings & Field Visibility"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#71717a] dark:text-[#a1a1aa]" />
              <span className="hidden md:inline">Display</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white dark:bg-[#27272a] text-[#52525b] dark:text-[#a1a1aa] border border-[#e4e4e7] dark:border-[#3f3f46]">
                {activeOptionalFieldsCount + 2}
              </span>
            </button>

            {/* Backup & Restore */}
            <button
              id="backup-restore-trigger-btn"
              onClick={onOpenBackup}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] text-[#52525b] dark:text-[#e4e4e7] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Backup & Restore"
            >
              <Database className="w-4 h-4 text-[#71717a] dark:text-[#a1a1aa]" />
              <span className="hidden md:inline">Backup</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] text-[#52525b] dark:text-[#a1a1aa] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] transition-colors cursor-pointer shadow-xs"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#52525b]" />}
            </button>

            {/* Register Key Primary CTA */}
            <button
              id="add-key-header-btn"
              onClick={onOpenAddModal}
              className="px-3.5 py-2 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-white dark:bg-[#f4f4f5] dark:hover:bg-[#e4e4e7] dark:text-[#09090b] text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Key</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Bottom Tier: Global Search & Dropdown Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Global Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71717a] dark:text-[#71717a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="global-search-input"
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search App Name, Key, Project, Account, Purpose..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] text-[#09090b] dark:text-[#f4f4f5] text-xs focus:outline-hidden focus:ring-2 focus:ring-[#71717a]/30 focus:border-[#71717a] transition-all placeholder:text-[#a1a1aa] dark:placeholder:text-[#71717a]"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Environment Filter */}
            <div className="relative flex-1 sm:flex-none">
              <select
                id="filter-environment-select"
                value={environmentFilter}
                onChange={(e) => onEnvironmentChange(e.target.value)}
                className="w-full sm:w-auto pl-3 pr-8 py-2 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] text-[#09090b] dark:text-[#a1a1aa] text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#71717a]/30 cursor-pointer"
              >
                <option value="All">All Environments</option>
                <option value="Homelab">Homelab</option>
                <option value="Prod">Prod</option>
                <option value="Dev">Dev</option>
                <option value="Staging">Staging</option>
                <option value="Testing">Testing</option>
                <option value="DMZ">DMZ</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative flex-1 sm:flex-none">
              <select
                id="filter-status-select"
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full sm:w-auto pl-3 pr-8 py-2 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] text-[#09090b] dark:text-[#a1a1aa] text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#71717a]/30 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="ExpiringSoon">Expiring Soon (≤7d)</option>
                <option value="Paused">Paused</option>
                <option value="Revoked">Revoked</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

