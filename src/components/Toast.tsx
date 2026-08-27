import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const config = {
          success: {
            bg: "bg-zinc-900 text-zinc-100 border-zinc-800 shadow-2xl",
            icon: CheckCircle2,
            iconColor: "text-emerald-400",
          },
          error: {
            bg: "bg-zinc-900 text-zinc-100 border-red-900/60 shadow-2xl",
            icon: AlertCircle,
            iconColor: "text-red-400",
          },
          warning: {
            bg: "bg-zinc-900 text-zinc-100 border-amber-900/60 shadow-2xl",
            icon: AlertTriangle,
            iconColor: "text-amber-400",
          },
          info: {
            bg: "bg-zinc-900 text-zinc-100 border-zinc-800 shadow-2xl",
            icon: Info,
            iconColor: "text-zinc-400",
          },
        }[toast.type];

        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-2.5 transition-all animate-in slide-in-from-bottom-2 ${config.bg}`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconColor}`} />
            <div className="flex-1 pr-1">
              <div className="text-xs font-semibold">{toast.title}</div>
              {toast.message && (
                <div className="text-[11px] opacity-80 mt-0.5 leading-snug">{toast.message}</div>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
