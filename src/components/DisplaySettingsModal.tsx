import React from "react";
import { FieldVisibilitySettings, OptionalFieldKey } from "../types";
import { FIELD_CONFIGS, VISIBILITY_PRESETS } from "../constants/fieldConfig";
import { SlidersHorizontal, Lock, Check, Sparkles, RotateCcw, X, Info } from "lucide-react";

interface DisplaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibility: FieldVisibilitySettings;
  onToggleField: (key: OptionalFieldKey) => void;
  onApplyPreset: (presetKey: string) => void;
  onReset: () => void;
}

export const DisplaySettingsModal: React.FC<DisplaySettingsModalProps> = ({
  isOpen,
  onClose,
  visibility,
  onToggleField,
  onApplyPreset,
  onReset,
}) => {
  if (!isOpen) return null;

  const categories = ["General", "Security & Access", "Dates & Lifecycle", "Contact & Notes"] as const;
  const totalOptional = FIELD_CONFIGS.length;
  const activeOptionalCount = Object.values(visibility).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="display-settings-modal"
        className="bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e4e4e7] dark:border-[#27272a] flex items-center justify-between bg-[#f4f4f5] dark:bg-[#27272a]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-[#09090b] dark:text-[#f4f4f5] border border-[#e4e4e7] dark:border-[#3f3f46]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#09090b] dark:text-[#f4f4f5]">
                Display Settings & Field Visibility
              </h2>
              <p className="text-xs text-[#71717a] dark:text-[#a1a1aa]">
                Customize visible columns and suppress form fields ({activeOptionalCount + 2} fields visible)
              </p>
            </div>
          </div>
          <button
            id="close-display-settings-btn"
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] rounded-lg hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Information Callout */}
          <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-[#09090b] dark:text-[#f4f4f5] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-zinc-600 dark:text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#09090b] dark:text-[#f4f4f5]">Dynamic Field Visibility Engine</p>
              <p className="text-[#71717a] dark:text-[#a1a1aa] mt-0.5 leading-relaxed">
                Toggled off fields are hidden from both the main table/cards and the Add/Edit form modals.
                Your underlying SQLite database schema stays complete and preserved.
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
                onClick={onReset}
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

          {/* Mandatory Fields (Always Visible) */}
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
                            {isVisible && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                          </div>
                          <div className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] line-clamp-1 mt-0.5">
                            {field.description}
                          </div>
                        </div>

                        {/* Custom Toggle Switch */}
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

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] flex items-center justify-between">
          <span className="text-xs text-[#71717a] dark:text-[#a1a1aa]">
            {activeOptionalCount} of {totalOptional} optional columns active
          </span>
          <button
            id="done-display-settings-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#09090b] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:text-[#09090b] dark:hover:bg-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
