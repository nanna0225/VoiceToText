"use client";

import { SOAPData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, Clock, Lock } from "lucide-react";

interface SOAPNoteProps {
  soap: SOAPData;
  onSOAPChange: (field: keyof SOAPData, value: string) => void;
  isDiagnosisConfirmed: boolean;
  finalDiagnosis: string;
  isAnalyzed: boolean;
}

const SECTION_META = {
  subjective: {
    label: "S — Subjective",
    color: "text-blue-700",
    border: "border-l-blue-400",
    bg: "bg-blue-50/40",
    hint: "환자가 호소하는 주증상 및 병력",
    rows: 4,
  },
  objective: {
    label: "O — Objective",
    color: "text-emerald-700",
    border: "border-l-emerald-400",
    bg: "bg-emerald-50/40",
    hint: "신체 진찰 소견 및 검사 결과",
    rows: 4,
  },
  assessment: {
    label: "A — Assessment",
    color: "text-violet-700",
    border: "border-l-violet-400",
    bg: "bg-violet-50/40",
    hint: "진단 및 임상적 판단",
    rows: 3,
  },
  plan: {
    label: "P — Plan",
    color: "text-orange-700",
    border: "border-l-orange-400",
    bg: "bg-orange-50/40",
    hint: "처방, 검사, 추적관찰 계획",
    rows: 5,
  },
} as const;

interface SOAPSectionProps {
  field: keyof SOAPData;
  value: string;
  onChange: (val: string) => void;
  isLocked?: boolean;
  placeholder?: string;
}

function SOAPSection({
  field,
  value,
  onChange,
  isLocked = false,
  placeholder,
}: SOAPSectionProps) {
  const meta = SECTION_META[field];
  return (
    <div
      className={`rounded-md border-l-4 ${meta.border} ${meta.bg} p-3 space-y-1.5`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-wide ${meta.color}`}>
          {meta.label}
        </span>
        {isLocked && (
          <Lock className="h-3 w-3 text-slate-400" />
        )}
      </div>
      <p className="text-[10px] text-slate-400">{meta.hint}</p>
      {isLocked ? (
        <div className="min-h-[56px] text-sm text-slate-500 italic px-1 py-1">
          {value || (
            <span className="text-slate-300">최종 진단 확정 후 자동 반영됩니다</span>
          )}
        </div>
      ) : (
        <Textarea
          rows={meta.rows}
          className="text-sm bg-white/80 border-slate-200 resize-none focus:bg-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || meta.hint}
          disabled={isLocked}
        />
      )}
    </div>
  );
}

export function SOAPNote({
  soap,
  onSOAPChange,
  isDiagnosisConfirmed,
  finalDiagnosis,
  isAnalyzed,
}: SOAPNoteProps) {
  const assessmentValue = isDiagnosisConfirmed
    ? finalDiagnosis
    : soap.assessment;

  return (
    <Card className="flex flex-col h-full border-slate-200 shadow-sm">
      <CardHeader className="pb-2 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-600" />
            <CardTitle className="text-slate-700">SOAP Note</CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            {isDiagnosisConfirmed ? (
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs gap-1">
                <CheckCircle2 className="h-3 w-3" />
                진단 확정
              </Badge>
            ) : isAnalyzed ? (
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-300 text-xs gap-1"
              >
                <Clock className="h-3 w-3" />
                진단 대기
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-400 text-xs">
                분석 전
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-3 flex-1 overflow-y-auto">
        {!isAnalyzed ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <FileText className="h-10 w-10 text-slate-200 mx-auto" />
              <p className="text-sm text-slate-400">
                좌측에서 진료 대화를 입력하고
              </p>
              <p className="text-sm text-slate-400 font-medium">
                &ldquo;분석 실행&rdquo;을 클릭하세요
              </p>
            </div>
          </div>
        ) : (
          <>
            <SOAPSection
              field="subjective"
              value={soap.subjective}
              onChange={(v) => onSOAPChange("subjective", v)}
            />
            <SOAPSection
              field="objective"
              value={soap.objective}
              onChange={(v) => onSOAPChange("objective", v)}
            />
            <SOAPSection
              field="assessment"
              value={assessmentValue}
              onChange={(v) => onSOAPChange("assessment", v)}
              isLocked={isDiagnosisConfirmed}
              placeholder="우측 패널에서 최종 진단을 확정하세요"
            />
            <SOAPSection
              field="plan"
              value={soap.plan}
              onChange={(v) => onSOAPChange("plan", v)}
              isLocked={!isDiagnosisConfirmed}
              placeholder="우측 처방 계획에서 항목을 선택하세요"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
