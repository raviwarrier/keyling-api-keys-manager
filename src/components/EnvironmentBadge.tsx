import React from "react";
import { Server, ShieldAlert, Laptop, Cpu, Globe, Boxes, Tag } from "lucide-react";

interface EnvironmentBadgeProps {
  environment?: string | null;
  size?: "sm" | "md";
}

const CUSTOM_PALETTES = [
  "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/50",
  "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50",
  "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/50",
  "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50",
  "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50",
  "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/50",
];

function getHashIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

export const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({ environment, size = "md" }) => {
  if (!environment) {
    return <span className="text-xs text-zinc-400 dark:text-zinc-600">—</span>;
  }

  const env = environment.trim();
  const lower = env.toLowerCase();

  let styles = "";
  let Icon = Tag;

  if (lower.includes("homelab") || lower.includes("home") || lower.includes("lab")) {
    styles = "bg-[#f2f4ec] text-[#4d5238] border-[#d5dcc6] dark:bg-[#23261e] dark:text-[#8d9178] dark:border-[#393d2e]";
    Icon = Server;
  } else if (lower.includes("prod")) {
    styles = "bg-[#eaf2ed] text-[#2c5a43] border-[#c7ded0] dark:bg-[#213028] dark:text-[#84a59d] dark:border-[#2e4338]";
    Icon = Globe;
  } else if (lower.includes("dev")) {
    styles = "bg-[#fdf5eb] text-[#8c5f2b] border-[#eedbc2] dark:bg-[#332a1e] dark:text-[#c7a47a] dark:border-[#483a29]";
    Icon = Laptop;
  } else if (lower.includes("staging") || lower.includes("test") || lower.includes("qa")) {
    styles = "bg-[#edf2f3] text-[#345358] border-[#c9dbe0] dark:bg-[#1e2a2d] dark:text-[#8ea4a8] dark:border-[#2b3d42]";
    Icon = Cpu;
  } else if (lower.includes("dmz") || lower.includes("sec")) {
    styles = "bg-[#f9ece6] text-[#854530] border-[#eed1c6] dark:bg-[#33231e] dark:text-[#c98d7c] dark:border-[#49312a]";
    Icon = ShieldAlert;
  } else {
    const paletteIndex = getHashIndex(env, CUSTOM_PALETTES.length);
    styles = CUSTOM_PALETTES[paletteIndex];
    Icon = Boxes;
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

