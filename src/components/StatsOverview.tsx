import React from "react";
import { AppStats } from "../types";
import { KeyRound, ShieldCheck, AlertTriangle, XOctagon, Pause, Layers } from "lucide-react";

interface StatsOverviewProps {
  stats: AppStats | null;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  selectedEnv: string;
  onSelectEnv: (env: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  selectedStatus,
  onSelectStatus,
  selectedEnv,
  onSelectEnv,
}) => {
  if (!stats) return null;

  const cards = [
    {
      id: "stat-total",
      label: "Total Keys",
      value: stats.total,
      filter: "All",
      icon: KeyRound,
      color: "text-[#09090b] dark:text-[#f4f4f5]",
      bg: "bg-white dark:bg-[#18181b] border-[#e4e4e7] dark:border-[#27272a]",
      activeRing: selectedStatus === "All" && selectedEnv === "All",
    },
    {
      id: "stat-active",
      label: "Active & Valid",
      value: stats.active,
      filter: "Active",
      icon: ShieldCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/30",
      activeRing: selectedStatus === "Active",
    },
    {
      id: "stat-expiring",
      label: "Expiring (≤7d)",
      value: stats.expiringSoon,
      filter: "ExpiringSoon",
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 dark:border-amber-500/30",
      badge: stats.expiringSoon > 0 ? "Expiring" : undefined,
      activeRing: selectedStatus === "ExpiringSoon",
    },
    {
      id: "stat-revoked",
      label: "Expired / Revoked",
      value: stats.revokedOrExpired,
      filter: "Revoked",
      icon: XOctagon,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/20 dark:border-rose-500/30",
      activeRing: selectedStatus === "Revoked",
    },
    {
      id: "stat-paused",
      label: "Paused",
      value: stats.paused,
      filter: "Paused",
      icon: Pause,
      color: "text-[#71717a] dark:text-[#a1a1aa]",
      bg: "bg-zinc-500/5 dark:bg-zinc-500/10 border-zinc-500/20 dark:border-zinc-500/30",
      activeRing: selectedStatus === "Paused",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              id={card.id}
              onClick={() => {
                if (card.filter === "ExpiringSoon") {
                  onSelectStatus(selectedStatus === "ExpiringSoon" ? "All" : "ExpiringSoon");
                } else if (card.filter === "All") {
                  onSelectStatus("All");
                  onSelectEnv("All");
                } else {
                  onSelectStatus(selectedStatus === card.filter ? "All" : card.filter);
                }
              }}
              className={`text-left p-3 sm:p-3.5 rounded-xl border transition-all relative overflow-hidden group cursor-pointer ${
                card.bg
              } ${
                card.activeRing
                  ? "ring-2 ring-[#71717a] dark:ring-[#a1a1aa] shadow-xs"
                  : "hover:border-[#71717a]/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-medium text-[#71717a] dark:text-[#a1a1aa] truncate">
                  {card.label}
                </span>
                <div className={`p-1 rounded-md ${card.color} bg-white/80 dark:bg-[#121214]/80`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className={`text-xl sm:text-2xl font-bold tracking-tight font-mono ${card.color}`}>
                  {card.value}
                </div>
                {card.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {card.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Environment Filter Pills */}
      {stats.byEnvironment && Object.keys(stats.byEnvironment).length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[#71717a] dark:text-[#a1a1aa] flex items-center gap-1 pl-1 font-medium whitespace-nowrap">
            <Layers className="w-3 h-3 text-[#71717a] dark:text-[#a1a1aa]" />
            Environments:
          </span>
          <button
            id="env-filter-all"
            onClick={() => onSelectEnv("All")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
              selectedEnv === "All"
                ? "bg-[#09090b] text-white dark:bg-[#f4f4f5] dark:text-[#09090b] border-transparent shadow-xs"
                : "bg-white dark:bg-[#18181b] text-[#52525b] dark:text-[#a1a1aa] border-[#e4e4e7] dark:border-[#27272a] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a]"
            }`}
          >
            All ({stats.total})
          </button>
          {Object.entries(stats.byEnvironment).map(([env, count]) => {
            const isSelected = selectedEnv === env;
            return (
              <button
                key={env}
                id={`env-filter-${env.toLowerCase()}`}
                onClick={() => onSelectEnv(isSelected ? "All" : env)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-[#27272a] text-white dark:bg-[#e4e4e7] dark:text-[#09090b] font-semibold border-transparent shadow-xs"
                    : "bg-white dark:bg-[#18181b] text-[#52525b] dark:text-[#a1a1aa] border-[#e4e4e7] dark:border-[#27272a] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a]"
                }`}
              >
                {env} <span className="opacity-70 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

