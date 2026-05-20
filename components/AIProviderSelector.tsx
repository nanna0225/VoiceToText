"use client";

import { useEffect, useState } from "react";
import { AIProvider, PROVIDER_INFO, LOCALSTORAGE_KEYS } from "@/lib/aiProviders";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Key, CheckCircle2 } from "lucide-react";

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  apiKey: string;
  onProviderChange: (p: AIProvider) => void;
  onApiKeyChange: (k: string) => void;
}

const PROVIDERS: AIProvider[] = ["mock", "openai", "gemini", "claude"];

const PROVIDER_ICONS: Record<AIProvider, string> = {
  mock: "⚙️",
  openai: "🤖",
  gemini: "✨",
  claude: "🔮",
};

const KEY_PLACEHOLDERS: Record<AIProvider, string> = {
  mock: "",
  openai: "sk-...",
  gemini: "AIza...",
  claude: "sk-ant-...",
};

export function AIProviderSelector({
  selectedProvider,
  apiKey,
  onProviderChange,
  onApiKeyChange,
}: AIProviderSelectorProps) {
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (selectedProvider === "mock") return;
    const stored = localStorage.getItem(LOCALSTORAGE_KEYS[selectedProvider]) ?? "";
    onApiKeyChange(stored);
  }, [selectedProvider]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleKeyChange(val: string) {
    onApiKeyChange(val);
    if (selectedProvider !== "mock") {
      localStorage.setItem(LOCALSTORAGE_KEYS[selectedProvider], val);
    }
  }

  function handleProviderChange(p: AIProvider) {
    setShowKey(false);
    onProviderChange(p);
  }

  const info = PROVIDER_INFO[selectedProvider];

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
        AI 분석 엔진
      </p>

      {/* Provider tabs */}
      <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1">
        {PROVIDERS.map((p) => {
          const pInfo = PROVIDER_INFO[p];
          const isActive = selectedProvider === p;
          return (
            <button
              key={p}
              onClick={() => handleProviderChange(p)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-md text-[11px] font-medium transition-all ${
                isActive
                  ? `bg-white shadow-sm ${pInfo.color} border ${pInfo.border}`
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
              }`}
            >
              <span className="text-base leading-none">{PROVIDER_ICONS[p]}</span>
              <span className="leading-none">{pInfo.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Model label */}
      <div className={`flex items-center justify-between rounded-md px-2.5 py-1.5 border ${info.bg} ${info.border}`}>
        <span className={`text-[10px] font-semibold ${info.color}`}>
          {info.label}
        </span>
        <span className={`text-[10px] font-mono opacity-70 ${info.color}`}>
          {info.model}
        </span>
      </div>

      {/* API key input */}
      {selectedProvider !== "mock" && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Key className="h-3 w-3" />
            <span>API Key</span>
            {apiKey && (
              <span className="flex items-center gap-0.5 text-emerald-500 ml-auto">
                <CheckCircle2 className="h-3 w-3" />
                저장됨
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder={KEY_PLACEHOLDERS[selectedProvider]}
              className="h-8 text-xs pr-8 font-mono border-slate-200 bg-white"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowKey((v) => !v)}
              tabIndex={-1}
            >
              {showKey ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            API 키는 브라우저 로컬 저장소에만 저장됩니다. 서버로 전송 후 사용되며 기록되지 않습니다.
          </p>
        </div>
      )}
    </div>
  );
}
