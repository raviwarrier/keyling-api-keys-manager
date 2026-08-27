import React, { useState, useEffect, useCallback } from "react";
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  X,
  ShieldCheck,
  Zap,
  Sliders,
  Plus,
  Layers,
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

export const SecretGeneratorModal: React.FC<SecretGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSelectSecret,
  onUseInNewKey,
}) => {
  const [length, setLength] = useState<number>(36);
  const [format, setFormat] = useState<SecretFormat>("alphanumeric");
  const [prefix, setPrefix] = useState<string>("hl_live_");
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
      prefix: format === "homelab-prefixed" ? prefix : undefined,
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
  }, [length, format, prefix, includeHyphens, batchCount]);

  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    }
  }, [isOpen, length, format, includeHyphens, batchCount]);

  if (!isOpen) return null;

  const entropy = calculateEntropy(currentSecret, format);

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
            id="close-secret-generator-btn"
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-[#09090b] dark:text-[#a1a1aa] dark:hover:text-[#f4f4f5] rounded-lg hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Display Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] uppercase tracking-wider">
                Generated Secret ({currentSecret.length} chars)
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    entropy.strength === "Very Strong"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : entropy.strength === "Strong"
                      ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  }`}
                >
                  {entropy.strength} ({entropy.bits} bits)
                </span>
              </div>
            </div>

            {/* Secret Value Display Box */}
            <div className="p-3.5 rounded-xl border border-[#e4e4e7] dark:border-[#3f3f46] bg-[#f4f4f5] dark:bg-[#27272a] flex items-center justify-between gap-3 shadow-inner">
              <div className="font-mono text-sm sm:text-base font-semibold text-[#09090b] dark:text-[#f4f4f5] break-all select-all flex-1 tracking-wider">
                {currentSecret}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id="regenerate-secret-btn"
                  onClick={handleGenerate}
                  className="p-2 rounded-lg bg-white dark:bg-[#18181b] text-[#52525b] dark:text-[#f4f4f5] hover:text-[#09090b] border border-[#e4e4e7] dark:border-[#3f3f46] transition-colors cursor-pointer hover:bg-[#e4e4e7] dark:hover:bg-[#27272a]"
                  title="Generate another secret"
                >
                  <RefreshCw className="w-4 h-4 text-[#71717a]" />
                </button>
                <button
                  id="copy-generated-secret-btn"
                  onClick={() => copyToClipboard(currentSecret, "main")}
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

          {/* Preset Lengths */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] uppercase tracking-wider">
                Length ({length} characters)
              </label>
              <div className="flex items-center gap-1.5">
                {LENGTH_PRESETS.map((preset) => (
                  <button
                    key={preset}
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

          {/* Format / Character Sets Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa] uppercase tracking-wider block">
              Format & Character Set
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat("alphanumeric")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  format === "alphanumeric"
                    ? "border-zinc-800 dark:border-zinc-300 bg-zinc-200/70 dark:bg-zinc-800/80 text-[#09090b] dark:text-[#f4f4f5] font-semibold"
                    : "border-[#e4e4e7] dark:border-[#3f3f46] bg-[#f4f4f5]/50 dark:bg-[#27272a]/50 text-[#52525b] dark:text-[#a1a1aa] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a]"
                }`}
              >
                <div className="font-semibold text-xs">Alphanumeric</div>
                <div className="text-[10px] font-mono opacity-75">A-Z, a-z, 0-9</div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("hex")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  format === "hex"
                    ? "border-zinc-800 dark:border-zinc-300 bg-zinc-200/70 dark:bg-zinc-800/80 text-[#09090b] dark:text-[#f4f4f5] font-semibold"
                    : "border-[#e4e4e7] dark:border-[#3f3f46] bg-[#f4f4f5]/50 dark:bg-[#27272a]/50 text-[#52525b] dark:text-[#a1a1aa] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a]"
                }`}
              >
                <div className="font-semibold text-xs">Hexadecimal</div>
                <div className="text-[10px] font-mono opacity-75">0-9, a-f (lower)</div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("hex-upper")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  format === "hex-upper"
                    ? "border-zinc-800 dark:border-zinc-300 bg-zinc-200/70 dark:bg-zinc-800/80 text-[#09090b] dark:text-[#f4f4f5] font-semibold"
                    : "border-[#e4e4e7] dark:border-[#3f3f46] bg-[#f4f4f5]/50 dark:bg-[#27272a]/50 text-[#52525b] dark:text-[#a1a1aa] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a]"
                }`}
              >
                <div className="font-semibold text-xs">Hex Uppercase</div>
                <div className="text-[10px] font-mono opacity-75">0-9, A-F</div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("alphanumeric-symbols")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  format === "alphanumeric-symbols"
                    ? "border-zinc-800 dark:border-zinc-300 bg-zinc-200/70 dark:bg-zinc-800/80 text-[#09090b] dark:text-[#f4f4f5] font-semibold"
                    : "border-[#e4e4e7] dark:border-[#3f3f46] bg-[#f4f4f5]/50 dark:bg-[#27272a]/50 text-[#52525b] dark:text-[#a1a1aa] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a]"
                }`}
              >
                <div className="font-semibold text-xs">Alpha + Symbols</div>
                <div className="text-[10px] font-mono opacity-75">Includes !@#$%^&*</div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("url-safe")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  format === "url-safe"
                    ? "border-zinc-800 dark:border-zinc-300 bg-zinc-200/70 dark:bg-zinc-800/80 text-[#09090b] dark:text-[#f4f4f5] font-semibold"
                    : "border-[#e4e4e7] dark:border-[#3f3f46] bg-[#f4f4f5]/50 dark:bg-[#27272a]/50 text-[#52525b] dark:text-[#a1a1aa] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a]"
                }`}
              >
                <div className="font-semibold text-xs">URL-Safe Base64</div>
                <div className="text-[10px] font-mono opacity-75">A-Z, a-z, 0-9, -, _</div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("uuid")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  format === "uuid"
                    ? "border-zinc-800 dark:border-zinc-300 bg-zinc-200/70 dark:bg-zinc-800/80 text-[#09090b] dark:text-[#f4f4f5] font-semibold"
                    : "border-[#e4e4e7] dark:border-[#3f3f46] bg-[#f4f4f5]/50 dark:bg-[#27272a]/50 text-[#52525b] dark:text-[#a1a1aa] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a]"
                }`}
              >
                <div className="font-semibold text-xs">UUID v4</div>
                <div className="text-[10px] font-mono opacity-75">8-4-4-4-12 hex</div>
              </button>
            </div>
          </div>

          {/* Optional Formatting & Batch Options */}
          <div className="p-3.5 rounded-xl bg-[#f4f4f5]/70 dark:bg-[#27272a]/70 border border-[#e4e4e7] dark:border-[#27272a] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Include hyphens */}
              <label className="flex items-center gap-2 text-xs font-medium text-[#09090b] dark:text-[#f4f4f5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHyphens}
                  onChange={(e) => setIncludeHyphens(e.target.checked)}
                  className="rounded border-[#d4d4d8] dark:border-[#3f3f46] text-[#09090b] dark:text-[#f4f4f5] focus:ring-[#71717a] cursor-pointer"
                />
                <span>Chunk with Hyphens (Readability)</span>
              </label>

              {/* Batch count */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#71717a] dark:text-[#a1a1aa]">Batch:</span>
                <div className="flex items-center bg-white dark:bg-[#18181b] p-0.5 rounded-lg border border-[#e4e4e7] dark:border-[#3f3f46]">
                  {[1, 5, 10].map((count) => (
                    <button
                      key={count}
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

            {/* Batch Results if count > 1 */}
            {batchCount > 1 && batchSecrets.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#e4e4e7] dark:border-[#27272a]">
                <div className="flex items-center justify-between text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa]">
                  <span>Batch of {batchSecrets.length} Secrets</span>
                  <button
                    onClick={() => copyToClipboard(batchSecrets.join("\n"), "all")}
                    className="text-[11px] text-[#09090b] dark:text-[#f4f4f5] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedAll ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAll ? "Copied All!" : "Copy All (newlines)"}</span>
                  </button>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {batchSecrets.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#3f3f46] flex items-center justify-between gap-2 text-xs font-mono"
                    >
                      <span className="truncate text-[#09090b] dark:text-[#f4f4f5]">{sec}</span>
                      <button
                        onClick={() => copyToClipboard(sec, "batch", idx)}
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
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] flex items-center justify-between gap-2">
          {onSelectSecret ? (
            <button
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
          ) : onUseInNewKey ? (
            <button
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
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              id="done-secret-generator-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
