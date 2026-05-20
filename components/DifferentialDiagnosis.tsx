"use client";

import { useState } from "react";
import { DiagnosisCandidate } from "@/lib/types";
import { AIProvider, PROVIDER_INFO } from "@/lib/aiProviders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Stethoscope,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Pencil,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface DifferentialDiagnosisProps {
  candidates: DiagnosisCandidate[];
  selectedCandidateId: string | null;
  isDiagnosisConfirmed: boolean;
  finalDiagnosis: string;
  isAnalyzed: boolean;
  usedProvider: AIProvider;
  selectedProvider: AIProvider;
  hasApiKey: boolean;
  isAILoading: boolean;
  onAIReanalyze: () => void;
  onSelectCandidate: (id: string) => void;
  onConfirmDiagnosis: () => void;
  onAddCandidate: (name: string) => void;
  onDeleteCandidate: (id: string) => void;
  onUpdateCandidateName: (id: string, name: string) => void;
}

const SCORE_COLOR = (score: number) => {
  if (score >= 60) return "bg-rose-500";
  if (score >= 30) return "bg-amber-500";
  if (score >= 10) return "bg-blue-400";
  return "bg-slate-300";
};

const SCORE_BADGE = (score: number) => {
  if (score >= 60) return "bg-rose-100 text-rose-700 border-rose-200";
  if (score >= 30) return "bg-amber-100 text-amber-700 border-amber-200";
  if (score >= 10) return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-slate-100 text-slate-500 border-slate-200";
};

export function DifferentialDiagnosis({
  candidates,
  selectedCandidateId,
  isDiagnosisConfirmed,
  finalDiagnosis,
  isAnalyzed,
  usedProvider,
  selectedProvider,
  hasApiKey,
  isAILoading,
  onAIReanalyze,
  onSelectCandidate,
  onConfirmDiagnosis,
  onAddCandidate,
  onDeleteCandidate,
  onUpdateCandidateName,
}: DifferentialDiagnosisProps) {
  const [newDiagName, setNewDiagName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function handleAdd() {
    if (newDiagName.trim()) {
      onAddCandidate(newDiagName.trim());
      setNewDiagName("");
    }
  }

  function startEdit(c: DiagnosisCandidate) {
    setEditingId(c.id);
    setEditValue(c.name);
  }

  function commitEdit(id: string) {
    if (editValue.trim()) {
      onUpdateCandidateName(id, editValue.trim());
    }
    setEditingId(null);
  }

  const pInfo = PROVIDER_INFO[usedProvider];
  const selectedPInfo = PROVIDER_INFO[selectedProvider];
  const canAIReanalyze =
    isAnalyzed &&
    !isDiagnosisConfirmed &&
    selectedProvider !== "mock" &&
    hasApiKey;

  return (
    <Card className="flex flex-col border-slate-200 shadow-sm">
      <CardHeader className="pb-2 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-rose-600" />
            <CardTitle className="text-slate-700">감별진단</CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            {isAnalyzed && !isDiagnosisConfirmed && (
              <Badge
                variant="outline"
                className={`text-xs gap-1 border ${pInfo.badgeBg}`}
              >
                <Sparkles className="h-3 w-3" />
                {pInfo.shortLabel}
              </Badge>
            )}
            {isDiagnosisConfirmed && (
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs gap-1">
                <CheckCircle2 className="h-3 w-3" />
                확정됨
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3 space-y-2">
        {/* AI Re-analyze button */}
        {canAIReanalyze && (
          <button
            onClick={onAIReanalyze}
            disabled={isAILoading}
            className={`w-full flex items-center justify-center gap-2 rounded-lg border py-2 px-3 text-xs font-semibold transition-all
              ${selectedPInfo.bg} ${selectedPInfo.border} ${selectedPInfo.color}
              hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAILoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {selectedPInfo.shortLabel} 분석 중...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                {selectedPInfo.shortLabel}로 감별진단 분석
                <RefreshCw className="h-3 w-3 opacity-60" />
              </>
            )}
          </button>
        )}

        {!isAnalyzed ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <div className="text-center space-y-1.5">
              <Stethoscope className="h-8 w-8 mx-auto text-slate-200" />
              <p className="text-sm">분석 실행 후 표시됩니다</p>
            </div>
          </div>
        ) : isAILoading && candidates.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Loader2 className={`h-8 w-8 mx-auto animate-spin ${selectedPInfo.color}`} />
              <p className="text-sm text-slate-500">AI가 감별진단을 분석 중입니다...</p>
            </div>
          </div>
        ) : (
          <>
            {isAILoading && (
              <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${selectedPInfo.bg} ${selectedPInfo.color} border ${selectedPInfo.border}`}>
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                AI가 새로운 감별진단을 생성하고 있습니다...
              </div>
            )}

            <div className="space-y-2">
              {candidates.map((c, i) => {
                const isSelected = c.id === selectedCandidateId;
                const isExpanded = expandedId === c.id;
                const isEditing = editingId === c.id;

                return (
                  <div
                    key={c.id}
                    className={`rounded-lg border transition-all ${
                      isSelected
                        ? "border-blue-400 bg-blue-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    } ${isDiagnosisConfirmed && !isSelected ? "opacity-50" : ""}`}
                  >
                    <div className="p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-slate-400 mt-0.5 w-4 shrink-0">
                          {i + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => commitEdit(c.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitEdit(c.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              className="h-7 text-sm"
                              autoFocus
                            />
                          ) : (
                            <span
                              className={`text-sm font-medium leading-tight ${
                                isSelected ? "text-blue-800" : "text-slate-700"
                              }`}
                            >
                              {c.name}
                              {c.isCustom && (
                                <span className="ml-1 text-xs text-slate-400 font-normal">
                                  (직접 입력)
                                </span>
                              )}
                            </span>
                          )}

                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${SCORE_COLOR(c.score)}`}
                                style={{ width: `${c.score}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-bold px-1.5 py-0.5 rounded border ${SCORE_BADGE(c.score)}`}
                            >
                              {c.score}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {!isDiagnosisConfirmed && (
                            <>
                              <button
                                className="text-slate-300 hover:text-blue-500 transition-colors p-0.5"
                                onClick={() => startEdit(c)}
                                title="이름 수정"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                className="text-slate-300 hover:text-red-500 transition-colors p-0.5"
                                onClick={() => onDeleteCandidate(c.id)}
                                title="삭제"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {c.evidence.length > 0 && (
                            <button
                              className="text-slate-300 hover:text-slate-600 transition-colors p-0.5"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : c.id)
                              }
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {isExpanded && c.evidence.length > 0 && (
                        <div className="ml-6 space-y-1 pt-1 border-t border-slate-100">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                            근거
                          </p>
                          {c.evidence.map((ev, j) => (
                            <div
                              key={j}
                              className="flex items-start gap-1.5 text-xs text-slate-600"
                            >
                              <span className="text-emerald-500 mt-0.5">✓</span>
                              {ev}
                            </div>
                          ))}
                        </div>
                      )}

                      {!isDiagnosisConfirmed && (
                        <div className="ml-6">
                          <Button
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            className={`h-7 text-xs w-full ${
                              isSelected
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                            onClick={() => onSelectCandidate(c.id)}
                          >
                            {isSelected ? "✓ 선택됨" : "이 진단 선택"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {!isDiagnosisConfirmed && (
              <>
                <div className="flex gap-2 pt-1">
                  <Input
                    className="h-8 text-xs flex-1 border-slate-200"
                    placeholder="진단명 직접 추가..."
                    value={newDiagName}
                    onChange={(e) => setNewDiagName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 border-slate-200 text-slate-600"
                    onClick={handleAdd}
                    disabled={!newDiagName.trim()}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Button
                  className={`w-full gap-2 font-semibold text-sm mt-1 ${
                    selectedCandidateId
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                  onClick={onConfirmDiagnosis}
                  disabled={!selectedCandidateId}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  최종 진단 확정
                </Button>

                {!selectedCandidateId && (
                  <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    후보 중 하나를 선택해야 확정 가능합니다
                  </p>
                )}
              </>
            )}

            {isDiagnosisConfirmed && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">
                    최종 진단 확정
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 pl-5">
                  {finalDiagnosis}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
