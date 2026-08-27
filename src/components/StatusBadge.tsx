import React from "react";
import { ApiKeyItem } from "../types";
import { evaluateKeyStatus } from "../utils/formatters";
import { CheckCircle2, AlertTriangle, XCircle, PauseCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  item: ApiKeyItem;
  size?: "sm" | "md";
  showSubtext?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ item, size = "md", showSubtext = false }) => {
  const evalStatus = evaluateKeyStatus(item);

  const config = {
    active: {
      bg: "bg-[#eaf2ed] text-[#2c5a43] border-[#c7ded0] dark:bg-[#213028] dark:text-[#84a59d] dark:border-[#2e4338]",
      dot: "bg-[#2c5a43] dark:bg-[#84a59d]",
      icon: CheckCircle2,
    },
    expiring: {
      bg: "bg-[#fdf5eb] text-[#8c5f2b] border-[#eedbc2] dark:bg-[#332a1e] dark:text-[#c7a47a] dark:border-[#483a29] animate-pulse",
      dot: "bg-[#8c5f2b] dark:bg-[#c7a47a]",
      icon: AlertTriangle,
    },
    expired: {
      bg: "bg-[#faecec] text-[#963838] border-[#eccdcd] dark:bg-[#331e1e] dark:text-[#c97c7c] dark:border-[#492a2a]",
      dot: "bg-[#963838] dark:bg-[#c97c7c]",
      icon: XCircle,
    },
    revoked: {
      bg: "bg-[#faecec] text-[#963838] border-[#eccdcd] dark:bg-[#331e1e] dark:text-[#c97c7c] dark:border-[#492a2a]",
      dot: "bg-[#963838] dark:bg-[#c97c7c]",
      icon: XCircle,
    },
    paused: {
      bg: "bg-[#ededdf] text-[#5e5e54] border-[#d5d5c5] dark:bg-[#252520] dark:text-[#8e8e82] dark:border-[#3d3d34]",
      dot: "bg-[#5e5e54] dark:bg-[#8e8e82]",
      icon: PauseCircle,
    },
  }[evalStatus.badgeVariant];

  const Icon = config.icon;
  const isSm = size === "sm";

  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      <span
        id={`status-badge-${item.id}`}
        className={`inline-flex items-center gap-1.5 font-medium border rounded-full whitespace-nowrap transition-colors ${
          isSm ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
        } ${config.bg}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <Icon className="w-3.5 h-3.5" />
        <span>{evalStatus.label}</span>
      </span>
      {showSubtext && evalStatus.subtext && (
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 pl-2 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {evalStatus.subtext}
        </span>
      )}
    </div>
  );
};
