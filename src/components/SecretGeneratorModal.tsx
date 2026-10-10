import React, { useState, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  X,
  Zap,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  generateSecret,
  calculateEntropy,
  SecretFormat,
  SecretGeneratorOptions,
} from "../utils/secretGenerator";

interface SecretGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSecret?: (secret: string) => void;
  onUseInNewKey?: (secret: string) => void;
}

const LENGTH_PRESETS = [24, 36, 48, 64];

interface FormatOption {
  id: SecretFormat;
  label: string;
  sublabel: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  { id: "alphanumeric", label: "Alphanumeric", sublabel: "A-Z, a-z, 0-9" },
  { id: "hex", label: "Hexadecimal", sublabel: "0-9, a-f (lower)" },
  { id: "hex-upper", label: "Hex Uppercase", sublabel: "0-9, A-F" },
  { id: "alphanumeric-symbols", label: "Alpha + Symbols", sublabel: "Includes !@#$%^&*" },
  { id: "url-safe", label: "URL-Safe Base64", sublabel: "A-Z, a-z, 0-9, -, _" },
  { id: "uuid", label: "UUID v4", sublabel: "8-4-4-4-12 hex" },
];

function getStrengthBadgeClass(strength: string): string {
  if (strength === "Very Strong") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
  }
  if (strength === "Strong") {
    return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
  }
  return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
}

interface SecretDisplaySectionProps {
  currentSecret: string;
  copiedMain: boolean;
  strengthBadgeClass: string;
  strengthText: string;
  bitsText: number;
  onGenerate: () => void;
  onCopyMain: () => void;
}

const SecretDisplaySection: React.FC<SecretDisplaySectionProps> = ({
  currentSecret,
  copiedMain,
  strengthBadgeClass,
  strengthText,
  bitsText,
  onGenerate,
  onCopyMain,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] uppercase tracking-wider">
        Generated Secret ({currentSecret.length} chars)
      </span>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${strengthBadgeClass}`}>
          {strengthText} ({bitsText} bits)
        </span>
      </div>
    </div>

    <div className="p-3.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-[#f4f4f5] dark:bg-[#27272a] flex items-center justify-between gap-3 shadow-inner">
      <div className="font-mono text-sm sm:text-base font-semibold text-[#09090b] dark:text-[#f4f4f5] break-all select-all flex-1 tracking-wider">
        {currentSecret}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          id="regenerate-secret-btn"
          onClick={onGenerate}
          className="p-2 rounded-lg bg-white dark:bg-[#18181b] text-[#52525b] dark:text-[#f4f4f5] hover:text-[#09090b] border border-[#e4e4e7] dark:border-[#3f3f46] transition-colors cursor-pointer hover:bg-[#e4e4e7] dark:hover:bg-[#27272a]"
          title="Generate another secret"
        >
          <RefreshCw className="w-4 h-4 text-[#71717a]" />
        </button>
        <button
          type="button"
          id="copy-generated-secret-btn"
          onClick={onCopyMain}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            copiedMain
              ? "bg-emerald-600 text-white"
              : "bg-[#09090b] text-white dark:bg-[#f4f4f5] dark:text-[#09090b] hover:bg-zinc-800 dark:hover:bg-zinc-200"
          }`}
        >
          {copiedMain ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

interface FormatSelectorProps {
  format: SecretFormat;
  onChangeFormat: (fmt: SecretFormat) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({ format, onChangeFormat }) => (
  <div className="space-y-2">
    <div className="text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] uppercase tracking-wider block">
      Format & Character Set
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {FORMAT_OPTIONS.map((opt) => {
        const isSelected = format === opt.id;
        const btnClass = isSelected
          ? "border-zinc-800 dark:border-zinc-300 bg-zinc-200/70 dark:bg-zinc-800/80 text-[#09090b] dark:text-[#f4f4f5] font-semibold"
          : "border-[#e4e4e7] dark:border-[#3f3f46] bg-[#f4f4f5]/50 dark:bg-[#27272a]/50 text-[#52525b] dark:text-[#a1a1aa] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a]";

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChangeFormat(opt.id)}
            className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${btnClass}`}
          >
            <div className="font-semibold text-xs">{opt.label}</div>
            <div className="text-[10px] font-mono opacity-75">{opt.sublabel}</div>
          </button>
        );
      })}
    </div>
  </div>
);

interface BatchListProps {
  batchSecrets: string[];
  copiedAll: boolean;
  copiedBatchIndex: number | null;
  onCopyAll: () => void;
  onCopySingle: (sec: string, idx: number) => void;
}

const BatchList: React.FC<BatchListProps> = ({
  batchSecrets,
  copiedAll,
  copiedBatchIndex,
  onCopyAll,
  onCopySingle,
}) => (
  <div className="space-y-2 pt-2 border-t border-[#e4e4e7] dark:border-[#27272a]">
    <div className="flex items-center justify-between text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa]">
      <span>Batch of {batchSecrets.length} Secrets</span>
      <button
        type="button"
        onClick={onCopyAll}
        className="text-[11px] text-[#09090b] dark:text-[#f4f4f5] hover:underline flex items-center gap-1 cursor-pointer"
      >
        {copiedAll ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        <span>{copiedAll ? "Copied All!" : "Copy All (newlines)"}</span>
      </button>
    </div>
    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
      {batchSecrets.map((sec, idx) => (
        <div
          key={`batch-item-${idx}-${sec.slice(0, 8)}`}
          className="p-2 rounded-lg bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#3f3f46] flex items-center justify-between gap-2 text-xs font-mono"
        >
          <span className="truncate text-[#09090b] dark:text-[#f4f4f5]">{sec}</span>
          <button
            type="button"
            onClick={() => onCopySingle(sec, idx)}
            className="p-1 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] rounded cursor-pointer shrink-0"
            title="Copy this secret"
          >
            {copiedBatchIndex === idx ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      ))}
    </div>
  </div>
);

interface SecretGeneratorFooterProps {
  currentSecret: string;
  onSelectSecret?: (secret: string) => void;
  onUseInNewKey?: (secret: string) => void;
  onClose: () => void;
}

const SecretGeneratorFooter: React.FC<SecretGeneratorFooterProps> = ({
  currentSecret,
  onSelectSecret,
  onUseInNewKey,
  onClose,
}) => {
  const renderActionBtn = () => {
    if (onSelectSecret) {
      return (
        <button
          type="button"
          id="insert-secret-into-form-btn"
          onClick={() => {
            onSelectSecret(currentSecret);
            onClose();
          }}
          className="px-4 py-2 rounded-xl bg-[#09090b] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:text-[#09090b] dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Use In Form</span>
        </button>
      );
    }
    if (onUseInNewKey) {
      return (
        <button
          type="button"
          id="use-secret-in-new-key-btn"
          onClick={() => {
            onUseInNewKey(currentSecret);
            onClose();
          }}
          className="px-4 py-2 rounded-xl bg-[#09090b] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:text-[#09090b] dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Key with this Secret</span>
        </button>
      );
    }
    return <div />;
  };

  return (
    <div className="px-6 py-3.5 border-t border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] flex items-center justify-between gap-2">
      {renderActionBtn()}
      <div className="flex items-center gap-2">
        <button
          type="button"
          id="done-secret-generator-btn"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-medium transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export const SecretGeneratorModal: React.FC<SecretGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSelectSecret,
  onUseInNewKey,
}) => {
  const [length, setLength] = useState<number>(36);
  const [format, setFormat] = useState<SecretFormat>("alphanumeric");
  const [includeHyphens, setIncludeHyphens] = useState<boolean>(false);
  const [currentSecret, setCurrentSecret] = useState<string>("");
  const [batchCount, setBatchCount] = useState<number>(1);
  const [batchSecrets, setBatchSecrets] = useState<string[]>([]);
  const [copiedMain, setCopiedMain] = useState<boolean>(false);
  const [copiedBatchIndex, setCopiedBatchIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const handleGenerate = useCallback(() => {
    const opts: SecretGeneratorOptions = {
      length,
      format,
      includeHyphens,
    };

    const main = generateSecret(opts);
    setCurrentSecret(main);
    setCopiedMain(false);

    if (batchCount > 1) {
      const batch: string[] = [];
      for (let i = 0; i < batchCount; i++) {
        batch.push(generateSecret(opts));
      }
      setBatchSecrets(batch);
    } else {
      setBatchSecrets([]);
    }
  }, [length, format, includeHyphens, batchCount]);

  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    }
  }, [isOpen, length, format, includeHyphens, batchCount, handleGenerate]);

  if (!isOpen) return null;

  const entropy = calculateEntropy(currentSecret, format);
  const strengthBadgeClass = getStrengthBadgeClass(entropy.strength);

  const copyToClipboard = async (text: string, type: "main" | "batch" | "all", index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "main") {
        setCopiedMain(true);
        setTimeout(() => setCopiedMain(false), 2000);
      } else if (type === "batch" && index !== undefined) {
        setCopiedBatchIndex(index);
        setTimeout(() => setCopiedBatchIndex(null), 2000);
      } else if (type === "all") {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="secret-generator-modal"
        className="bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e4e4e7] dark:border-[#27272a] flex items-center justify-between bg-[#f4f4f5] dark:bg-[#27272a]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-[#09090b] dark:text-[#f4f4f5] border border-[#e4e4e7] dark:border-[#3f3f46]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#09090b] dark:text-[#f4f4f5]">
                Secret & Token Generator
              </h2>
              <p className="text-xs text-[#71717a] dark:text-[#a1a1aa]">
                Cryptographically secure alphanumeric, hex, and token generation
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-secret-generator-btn"
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] rounded-lg hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <SecretDisplaySection
            currentSecret={currentSecret}
            copiedMain={copiedMain}
            strengthBadgeClass={strengthBadgeClass}
            strengthText={entropy.strength}
            bitsText={entropy.bits}
            onGenerate={handleGenerate}
            onCopyMain={() => copyToClipboard(currentSecret, "main")}
          />

          {/* Preset Lengths */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="custom-length-slider" className="text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] uppercase tracking-wider">
                Length ({length} characters)
              </label>
              <div className="flex items-center gap-1.5">
                {LENGTH_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    id={`length-preset-${preset}-btn`}
                    onClick={() => setLength(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      length === preset
                        ? "bg-[#09090b] text-white dark:bg-[#f4f4f5] dark:text-[#09090b] shadow-xs"
                        : "bg-[#f4f4f5] dark:bg-[#27272a] text-[#52525b] dark:text-[#a1a1aa] border border-[#e4e4e7] dark:border-[#3f3f46] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Length Slider */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] font-mono text-[#71717a] dark:text-[#a1a1aa]">8</span>
              <input
                id="custom-length-slider"
                type="range"
                min="8"
                max="128"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-1.5 bg-[#e4e4e7] dark:border dark:bg-[#3f3f46] rounded-lg appearance-none cursor-pointer accent-zinc-800 dark:accent-zinc-200"
              />
              <span className="text-[11px] font-mono text-[#71717a] dark:text-[#a1a1aa]">128</span>
            </div>
          </div>

          <FormatSelector format={format} onChangeFormat={setFormat} />

          {/* Optional Formatting & Batch Options */}
          <div className="p-3.5 rounded-xl bg-[#f4f4f5]/70 dark:bg-[#27272a]/70 border border-[#e4e4e7] dark:border-[#27272a] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-[#09090b] dark:text-[#f4f4f5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHyphens}
                  onChange={(e) => setIncludeHyphens(e.target.checked)}
                  className="rounded border-[#d4d4d8] dark:border-[#3f3f46] text-[#09090b] dark:text-[#f4f4f5] focus:ring-[#71717a] cursor-pointer"
                />
                <span>Chunk with Hyphens (Readability)</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#71717a] dark:text-[#a1a1aa]">Batch:</span>
                <div className="flex items-center bg-white dark:bg-[#18181b] p-0.5 rounded-lg border border-[#e4e4e7] dark:border-[#3f3f46]">
                  {[1, 5, 10].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setBatchCount(count)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                        batchCount === count
                          ? "bg-[#09090b] text-white dark:bg-[#f4f4f5] dark:text-[#09090b]"
                          : "text-[#71717a] dark:text-[#a1a1aa] hover:text-[#09090b] dark:hover:text-[#f4f4f5]"
                      }`}
                    >
                      {count}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {batchCount > 1 && batchSecrets.length > 0 && (
              <BatchList
                batchSecrets={batchSecrets}
                copiedAll={copiedAll}
                copiedBatchIndex={copiedBatchIndex}
                onCopyAll={() => copyToClipboard(batchSecrets.join("\n"), "all")}
                onCopySingle={(sec, idx) => copyToClipboard(sec, "batch", idx)}
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <SecretGeneratorFooter
          currentSecret={currentSecret}
          onSelectSecret={onSelectSecret}
          onUseInNewKey={onUseInNewKey}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
