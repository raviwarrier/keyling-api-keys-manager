import React from "react";
import { Server, ShieldAlert, Laptop, Cpu, Globe, Boxes } from "lucide-react";

interface EnvironmentBadgeProps {
  environment?: string | null;
  size?: "sm" | "md";
}

export const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({ environment, size = "md" }) => {
  if (!environment) {
    return <span className="text-xs text-zinc-400 dark:text-zinc-600">—</span>;
  }

  const env = environment.trim();
  const lower = env.toLowerCase();

  let styles = "bg-[#ededdf] text-[#5e5e54] border-[#d5d5c5] dark:bg-[#252520] dark:text-[#a5a59a] dark:border-[#3d3d34]";
  let Icon = Boxes;

  if (lower.includes("homelab")) {
    styles = "bg-[#f2f4ec] text-[#4d5238] border-[#d5dcc6] dark:bg-[#23261e] dark:text-[#8d9178] dark:border-[#393d2e]";
    Icon = Server;
  } else if (lower.includes("prod")) {
    styles = "bg-[#eaf2ed] text-[#2c5a43] border-[#c7ded0] dark:bg-[#213028] dark:text-[#84a59d] dark:border-[#2e4338]";
    Icon = Globe;
  } else if (lower.includes("dev")) {
    styles = "bg-[#fdf5eb] text-[#8c5f2b] border-[#eedbc2] dark:bg-[#332a1e] dark:text-[#c7a47a] dark:border-[#483a29]";
    Icon = Laptop;
  } else if (lower.includes("staging") || lower.includes("test")) {
    styles = "bg-[#edf2f3] text-[#345358] border-[#c9dbe0] dark:bg-[#1e2a2d] dark:text-[#8ea4a8] dark:border-[#2b3d42]";
    Icon = Cpu;
  } else if (lower.includes("dmz") || lower.includes("sec")) {
    styles = "bg-[#f9ece6] text-[#854530] border-[#eed1c6] dark:bg-[#33231e] dark:text-[#c98d7c] dark:border-[#49312a]";
    Icon = ShieldAlert;
  }

  const isSm = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-md whitespace-nowrap ${
        isSm ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs"
      } ${styles}`}
    >
      <Icon className="w-3 h-3 opacity-80" />
      <span>{env}</span>
    </span>
  );
};
