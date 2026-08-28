import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Database,
  Moon,
  Sun,
  Plus,
  LayoutGrid,
  List,
  X,
  Sparkles,
  Menu,
  Tag,
  ArrowUpDown,
  FileJson,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import { KeylingLogo } from "./KeylingLogo";
import { SettingsTab } from "./SettingsModal";

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
  onOpenSettings: (tab?: SettingsTab) => void;
  onOpenSecretGenerator: () => void;
  onOpenAddModal: () => void;
  environments: string[];
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
  onOpenSecretGenerator,
  onOpenAddModal,
  environments,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

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
            {/* View Mode Toggle (Table / Card) - Unchanged */}
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

            {/* Secret Generator Utility Trigger - Unchanged */}
            <button
              id="secret-generator-trigger-btn"
              onClick={onOpenSecretGenerator}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] text-[#52525b] dark:text-[#e4e4e7] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Secret & Token Generator (24, 36, 48, 64 chars Alphanumeric / Hex)"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">Secrets</span>
            </button>

            {/* Dark / Light Mode Toggle - Unchanged */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] text-[#52525b] dark:text-[#a1a1aa] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] transition-colors cursor-pointer shadow-xs"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#52525b]" />}
            </button>

            {/* Hamburger Menu Dropdown Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                id="hamburger-menu-btn"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs text-xs font-medium ${
                  isMenuOpen
                    ? "border-zinc-400 bg-zinc-200 dark:bg-zinc-800 text-[#09090b] dark:text-[#f4f4f5]"
                    : "border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] text-[#52525b] dark:text-[#e4e4e7] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a]"
                }`}
                title="Application Settings & Tools"
              >
                <Menu className="w-4 h-4" />
                <span className="hidden md:inline">Menu</span>
              </button>

              {/* Hamburger Dropdown Content */}
              {isMenuOpen && (
                <div
                  id="hamburger-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3.5 py-2 border-b border-[#e4e4e7] dark:border-[#27272a]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] block">
                      Settings & Tools
                    </span>
                  </div>

                  {/* Display & Fields */}
                  <button
                    id="menu-display-settings-btn"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSettings("display");
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#09090b] dark:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-zinc-500 shrink-0" />
                    <div>
                      <div className="font-medium">Display & Fields</div>
                      <div className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">Toggle optional fields</div>
                    </div>
                  </button>

                  {/* Column Rearrangement */}
                  <button
                    id="menu-columns-settings-btn"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSettings("columns");
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#09090b] dark:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <ArrowUpDown className="w-4 h-4 text-zinc-500 shrink-0" />
                    <div>
                      <div className="font-medium">Rearrange Columns</div>
                      <div className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">Reorder table view columns</div>
                    </div>
                  </button>

                  {/* Environment Labels Management */}
                  <button
                    id="menu-environments-settings-btn"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSettings("environments");
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#09090b] dark:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Tag className="w-4 h-4 text-zinc-500 shrink-0" />
                    <div>
                      <div className="font-medium">Environment Labels</div>
                      <div className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">Add / edit / delete labels</div>
                    </div>
                  </button>

                  {/* Backup & Restore */}
                  <button
                    id="menu-backup-settings-btn"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSettings("backup");
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#09090b] dark:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Database className="w-4 h-4 text-zinc-500 shrink-0" />
                    <div>
                      <div className="font-medium">Backup & Restore</div>
                      <div className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">Export / import SQLite data</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-[#e4e4e7] dark:border-[#27272a]" />

                  {/* Quick Direct Exports */}
                  <a
                    href="/api/export/json"
                    download
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left text-xs text-[#52525b] dark:text-[#a1a1aa] hover:text-[#09090b] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileJson className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Download JSON Backup</span>
                  </a>

                  <a
                    href="/api/export/csv"
                    download
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left text-xs text-[#52525b] dark:text-[#a1a1aa] hover:text-[#09090b] dark:hover:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Download CSV Sheet</span>
                  </a>
                </div>
              )}
            </div>

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
              placeholder="Search App Name, Provider, Key, Project, Account, Purpose..."
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
            {/* Dynamic Environment Filter */}
            <div className="relative flex-1 sm:flex-none">
              <select
                id="filter-environment-select"
                value={environmentFilter}
                onChange={(e) => onEnvironmentChange(e.target.value)}
                className="w-full sm:w-auto pl-3 pr-8 py-2 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] text-[#09090b] dark:text-[#a1a1aa] text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#71717a]/30 cursor-pointer"
              >
                <option value="All">All Environments</option>
                {environments.map((env) => (
                  <option key={env} value={env}>
                    {env}
                  </option>
                ))}
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
