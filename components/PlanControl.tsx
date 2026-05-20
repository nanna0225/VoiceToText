"use client";

import { PlanItem } from "@/lib/types";
import { AIProvider, PROVIDER_INFO } from "@/lib/aiProviders";
import { CATEGORY_LABELS, CATEGORY_STYLES } from "@/lib/planRules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Lock,
  Unlock,
  CheckSquare,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface PlanControlProps {
  planItems: PlanItem[];
  selectedPlanIds: string[];
  isDiagnosisConfirmed: boolean;
  finalDiagnosis: string;
  usedProvider: AIProvider;
  selectedProvider: AIProvider;
  hasApiKey: boolean;
  isAIPlanLoading: boolean;
  onAIGeneratePlan: () => void;
  onTogglePlan: (id: string) => void;
}

export function PlanControl({
  planItems,
  selectedPlanIds,
  isDiagnosisConfirmed,
  finalDiagnosis,
  usedProvider,
  selectedProvider,
  hasApiKey,
  isAIPlanLoading,
  onAIGeneratePlan,
  onTogglePlan,
}: PlanControlProps) {
  const grouped = planItems.reduce<Record<string, PlanItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categoryOrder = [
    "imaging",
    "medication",
    "therapy",
    "procedure",
    "followup",
    "education",
  ];

  const orderedCategories = categoryOrder.filter((c) => grouped[c]);
  const pInfo = PROVIDER_INFO[usedProvider];
  const selectedPInfo = PROVIDER_INFO[selectedProvider];
  const canAIGeneratePlan =
    isDiagnosisConfirmed && selectedProvider !== "mock" && hasApiKey;

  return (
    <Card
      className={`flex flex-col border-slate-200 shadow-sm transition-all ${
        !isDiagnosisConfirmed ? "opacity-80" : ""
      }`}
    >
      <CardHeader className="pb-2 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-orange-500" />
            <CardTitle className="text-slate-700">처방 계획</CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            {isDiagnosisConfirmed && usedProvider !== "mock" && (
              <Badge
                variant="outline"
                className={`text-xs gap-1 border ${pInfo.badgeBg}`}
              >
                <Sparkles className="h-3 w-3" />
                {pInfo.shortLabel}
              </Badge>
            )}
            {isDiagnosisConfirmed ? (
              <Badge className="bg-orange-100 text-orange-700 border border-orange-200 text-xs gap-1">
                <Unlock className="h-3 w-3" />
                계획 반영 가능
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-slate-400 border-slate-300 text-xs gap-1"
              >
                <Lock className="h-3 w-3" />
                진단 확정 필요
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3">
        {!isDiagnosisConfirmed ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <div className="rounded-full bg-slate-100 p-3">
              <Lock className="h-6 w-6 text-slate-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-slate-500">
                처방 계획이 잠겨 있습니다
              </p>
              <p className="text-xs text-slate-400">
                감별진단에서 최종 진단을 확정하면
              </p>
              <p className="text-xs text-slate-400">
                처방 계획이 활성화됩니다
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* AI Generate Plan button */}
            {canAIGeneratePlan && (
              <button
                onClick={onAIGeneratePlan}
                disabled={isAIPlanLoading}
                className={`w-full flex items-center justify-center gap-2 rounded-lg border py-2 px-3 text-xs font-semibold transition-all
                  ${selectedPInfo.bg} ${selectedPInfo.border} ${selectedPInfo.color}
                  hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isAIPlanLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {selectedPInfo.shortLabel} 계획 생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    {selectedPInfo.shortLabel}로 처방 계획 생성
                    <RefreshCw className="h-3 w-3 opacity-60" />
                  </>
                )}
              </button>
            )}

            {/* AI loading state overlay */}
            {isAIPlanLoading && (
              <div className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-xs ${selectedPInfo.bg} ${selectedPInfo.color} border ${selectedPInfo.border}`}>
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                <span>
                  <span className="font-semibold">{finalDiagnosis}</span>에 대한
                  AI 맞춤 처방 계획을 생성하고 있습니다...
                </span>
              </div>
            )}

            {planItems.length === 0 && !isAIPlanLoading ? (
              <p className="text-center text-sm text-slate-400 py-2">
                위 버튼으로 AI 처방 계획을 생성하세요
              </p>
            ) : planItems.length > 0 ? (
              <>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{finalDiagnosis}</span>에
                  대한 권장 계획입니다. 선택 시 SOAP Plan에 자동 반영됩니다.
                </p>

                {orderedCategories.map((cat) => {
                  const style = CATEGORY_STYLES[cat] ?? CATEGORY_STYLES.followup;
                  const items = grouped[cat];

                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${style.dot}`}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {CATEGORY_LABELS[cat] ?? cat}
                        </span>
                      </div>
                      {items.map((item) => {
                        const checked = selectedPlanIds.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`flex items-start gap-2.5 rounded-md border px-3 py-2 cursor-pointer transition-all ${
                              checked
                                ? `${style.bg} ${style.border} shadow-sm`
                                : "bg-white border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => onTogglePlan(item.id)}
                              className={`mt-0.5 shrink-0 ${
                                checked ? "border-current" : "border-slate-300"
                              }`}
                            />
                            <span
                              className={`text-xs leading-relaxed ${
                                checked ? style.text : "text-slate-600"
                              } ${checked ? "font-medium" : ""}`}
                            >
                              {item.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  );
                })}

                {selectedPlanIds.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <CheckSquare className="h-3.5 w-3.5" />
                      <span className="font-medium">
                        {selectedPlanIds.length}개 항목 선택됨 — SOAP Plan에 반영 중
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
