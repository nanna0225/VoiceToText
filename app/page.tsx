"use client";

import { useState, useCallback } from "react";
import { PatientHeader } from "@/components/PatientHeader";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { SOAPNote } from "@/components/SOAPNote";
import { DifferentialDiagnosis } from "@/components/DifferentialDiagnosis";
import { PlanControl } from "@/components/PlanControl";
import { analyzeTranscript } from "@/lib/mockAnalyzer";
import { getPlansForDiagnosis } from "@/lib/planRules";
import { AIProvider, AIRawResult } from "@/lib/aiProviders";
import { Patient, SOAPData, DiagnosisCandidate, PlanItem } from "@/lib/types";
import { ShieldAlert } from "lucide-react";

const MOCK_PATIENT: Patient = {
  id: "PT-20240520-001",
  gender: "M",
  age: 52,
  visitDate: "2026-05-20",
  version: "1.0.0",
};

const INITIAL_SOAP: SOAPData = {
  subjective: "",
  objective: "",
  assessment: "",
  plan: "",
};

async function callAI(body: Record<string, unknown>): Promise<AIRawResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "AI 분석 실패");
  return data.result as AIRawResult;
}

export default function Home() {
  // Core state
  const [transcript, setTranscript] = useState("");
  const [soap, setSOAP] = useState<SOAPData>(INITIAL_SOAP);
  const [candidates, setCandidates] = useState<DiagnosisCandidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [isDiagnosisConfirmed, setIsDiagnosisConfirmed] = useState(false);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // AI provider state
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("mock");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [usedProvider, setUsedProvider] = useState<AIProvider>("mock");

  // Per-panel AI loading states
  const [isDiagnosisAILoading, setIsDiagnosisAILoading] = useState(false);
  const [isPlanAILoading, setIsPlanAILoading] = useState(false);

  // ── Full analysis (transcript → SOAP + diagnosis + plan) ──────────────────
  const handleAnalyze = useCallback(async () => {
    if (!transcript.trim()) return;
    setIsLoading(true);
    setAnalysisError(null);

    try {
      let newCandidates: DiagnosisCandidate[];
      let newSOAP: SOAPData;
      let aiPlans: PlanItem[] = [];

      if (selectedProvider === "mock") {
        const result = analyzeTranscript(transcript);
        newSOAP = result.soap;
        newCandidates = result.candidates;
      } else {
        const raw = await callAI({
          mode: "full",
          transcript,
          provider: selectedProvider,
          apiKey,
        });

        newSOAP = {
          subjective: raw.soap?.subjective ?? "",
          objective: raw.soap?.objective ?? "",
          assessment: "",
          plan: "",
        };

        newCandidates = (raw.differentialDiagnoses ?? []).map((d) => ({
          id: d.name.toLowerCase().replace(/[\s/()]+/g, "-"),
          name: d.name,
          score: d.score,
          evidence: d.evidence,
        }));

        aiPlans = (raw.treatmentPlan ?? []).map((p, i) => ({
          id: `ai-plan-${i}`,
          label: p.label,
          category: p.category as PlanItem["category"],
        }));
      }

      setSOAP(newSOAP);
      setCandidates(newCandidates);
      setSelectedCandidateId(null);
      setFinalDiagnosis("");
      setIsDiagnosisConfirmed(false);
      setSelectedPlanIds([]);
      // Store AI plans for later use on diagnosis confirm
      setPlanItems(aiPlans);
      setIsAnalyzed(true);
      setUsedProvider(selectedProvider);
    } catch (err) {
      setAnalysisError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  }, [transcript, selectedProvider, apiKey]);

  // ── AI re-analyze: just differential diagnoses from current SOAP S/O ──────
  const handleAIReanalyzeDiagnosis = useCallback(async () => {
    if (selectedProvider === "mock" || !apiKey.trim()) return;
    setIsDiagnosisAILoading(true);

    try {
      const raw = await callAI({
        mode: "diagnose",
        soap: { subjective: soap.subjective, objective: soap.objective },
        provider: selectedProvider,
        apiKey,
      });

      const newCandidates: DiagnosisCandidate[] = (raw.differentialDiagnoses ?? []).map((d) => ({
        id: d.name.toLowerCase().replace(/[\s/()]+/g, "-"),
        name: d.name,
        score: d.score,
        evidence: d.evidence,
      }));

      setCandidates(newCandidates);
      setSelectedCandidateId(null);
      setUsedProvider(selectedProvider);
    } catch (err) {
      setAnalysisError(
        err instanceof Error ? err.message : "감별진단 AI 분석 실패"
      );
    } finally {
      setIsDiagnosisAILoading(false);
    }
  }, [soap, selectedProvider, apiKey]);

  // ── AI generate plan: treatment plan for confirmed diagnosis ──────────────
  const handleAIGeneratePlan = useCallback(async () => {
    if (selectedProvider === "mock" || !apiKey.trim() || !finalDiagnosis) return;
    setIsPlanAILoading(true);

    try {
      const raw = await callAI({
        mode: "plan",
        diagnosis: finalDiagnosis,
        soap: { subjective: soap.subjective, objective: soap.objective },
        provider: selectedProvider,
        apiKey,
      });

      const newPlans: PlanItem[] = (raw.treatmentPlan ?? []).map((p, i) => ({
        id: `ai-plan-${i}-${Date.now()}`,
        label: p.label,
        category: p.category as PlanItem["category"],
      }));

      setPlanItems(newPlans);
      setSelectedPlanIds([]);
      setSOAP((s) => ({ ...s, plan: "" }));
      setUsedProvider(selectedProvider);
    } catch (err) {
      setAnalysisError(
        err instanceof Error ? err.message : "처방 계획 AI 생성 실패"
      );
    } finally {
      setIsPlanAILoading(false);
    }
  }, [finalDiagnosis, soap, selectedProvider, apiKey]);

  // ── SOAP edit ─────────────────────────────────────────────────────────────
  const handleSOAPChange = useCallback(
    (field: keyof SOAPData, value: string) => {
      setSOAP((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // ── Diagnosis flow ────────────────────────────────────────────────────────
  const handleSelectCandidate = useCallback((id: string) => {
    setSelectedCandidateId((prev) => (prev === id ? null : id));
  }, []);

  const handleConfirmDiagnosis = useCallback(() => {
    const selected = candidates.find((c) => c.id === selectedCandidateId);
    if (!selected) return;

    const diagName = selected.name;
    setFinalDiagnosis(diagName);
    setIsDiagnosisConfirmed(true);
    setSOAP((prev) => ({ ...prev, assessment: diagName }));

    // If AI was used and we have pending AI plans, show them;
    // otherwise fall back to rule-based
    if (usedProvider !== "mock" && planItems.length > 0) {
      // Plans already loaded from full analysis — keep them
    } else if (usedProvider === "mock") {
      const plans = getPlansForDiagnosis(diagName);
      setPlanItems(plans);
    }
    // For AI provider with no pending plans: leave empty so user can click "AI로 계획 생성"
    else {
      setPlanItems([]);
    }

    setSelectedPlanIds([]);
  }, [candidates, selectedCandidateId, usedProvider, planItems]);

  const handleAddCandidate = useCallback((name: string) => {
    const id = `custom-${Date.now()}`;
    setCandidates((prev) => [
      ...prev,
      { id, name, score: 0, evidence: [], isCustom: true },
    ]);
  }, []);

  const handleDeleteCandidate = useCallback(
    (id: string) => {
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      if (selectedCandidateId === id) setSelectedCandidateId(null);
    },
    [selectedCandidateId]
  );

  const handleUpdateCandidateName = useCallback((id: string, name: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
  }, []);

  // ── Plan toggle ───────────────────────────────────────────────────────────
  const handleTogglePlan = useCallback(
    (id: string) => {
      setSelectedPlanIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((p) => p !== id)
          : [...prev, id];

        const selected = planItems.filter((p) => next.includes(p.id));
        const planText = selected.map((p) => `• ${p.label}`).join("\n");
        setSOAP((s) => ({ ...s, plan: planText }));
        return next;
      });
    },
    [planItems]
  );

  const allPlanLabels: Record<string, string> = Object.fromEntries(
    planItems.map((p) => [p.id, p.label])
  );

  const hasApiKey = apiKey.trim().length > 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      <PatientHeader patient={MOCK_PATIENT} />

      <main className="flex-1 overflow-hidden p-3 gap-3 grid grid-cols-[1fr_1.15fr_1fr] min-h-0">
        <div className="min-h-0 overflow-hidden flex flex-col">
          <TranscriptPanel
            transcript={transcript}
            onTranscriptChange={setTranscript}
            onAnalyze={handleAnalyze}
            isAnalyzed={isAnalyzed}
            isLoading={isLoading}
            analysisError={analysisError}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            usedProvider={usedProvider}
            soap={soap}
            isDiagnosisConfirmed={isDiagnosisConfirmed}
            finalDiagnosis={finalDiagnosis}
            selectedPlanIds={selectedPlanIds}
            allPlanLabels={allPlanLabels}
          />
        </div>

        <div className="min-h-0 overflow-hidden flex flex-col">
          <SOAPNote
            soap={soap}
            onSOAPChange={handleSOAPChange}
            isDiagnosisConfirmed={isDiagnosisConfirmed}
            finalDiagnosis={finalDiagnosis}
            isAnalyzed={isAnalyzed}
          />
        </div>

        <div className="min-h-0 overflow-y-auto flex flex-col gap-3 pr-0.5">
          <DifferentialDiagnosis
            candidates={candidates}
            selectedCandidateId={selectedCandidateId}
            isDiagnosisConfirmed={isDiagnosisConfirmed}
            finalDiagnosis={finalDiagnosis}
            isAnalyzed={isAnalyzed}
            usedProvider={usedProvider}
            selectedProvider={selectedProvider}
            hasApiKey={hasApiKey}
            isAILoading={isDiagnosisAILoading}
            onAIReanalyze={handleAIReanalyzeDiagnosis}
            onSelectCandidate={handleSelectCandidate}
            onConfirmDiagnosis={handleConfirmDiagnosis}
            onAddCandidate={handleAddCandidate}
            onDeleteCandidate={handleDeleteCandidate}
            onUpdateCandidateName={handleUpdateCandidateName}
          />
          <PlanControl
            planItems={planItems}
            selectedPlanIds={selectedPlanIds}
            isDiagnosisConfirmed={isDiagnosisConfirmed}
            finalDiagnosis={finalDiagnosis}
            usedProvider={usedProvider}
            selectedProvider={selectedProvider}
            hasApiKey={hasApiKey}
            isAIPlanLoading={isPlanAILoading}
            onAIGeneratePlan={handleAIGeneratePlan}
            onTogglePlan={handleTogglePlan}
          />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
          <span>
            <strong className="text-slate-600">
              Clinical Decision Support Tool Only —
            </strong>{" "}
            This software does not replace clinical judgment.{" "}
            <strong>Final diagnosis must be confirmed by physician.</strong>{" "}
            All outputs are suggestions only.
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono shrink-0 ml-4">
          MedAI Scribe v1.1.0 · MVP
        </span>
      </footer>
    </div>
  );
}
