export interface Patient {
  id: string;
  gender: "M" | "F";
  age: number;
  visitDate: string;
  version: string;
}

export interface SOAPData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface DiagnosisCandidate {
  id: string;
  name: string;
  score: number;
  evidence: string[];
  isCustom?: boolean;
}

export interface AppState {
  transcript: string;
  soap: SOAPData;
  candidates: DiagnosisCandidate[];
  selectedCandidateId: string | null;
  finalDiagnosis: string;
  isDiagnosisConfirmed: boolean;
  selectedPlanIds: string[];
  isAnalyzed: boolean;
}

export type PlanCategory =
  | "imaging"
  | "medication"
  | "therapy"
  | "procedure"
  | "followup"
  | "education";

export interface PlanItem {
  id: string;
  label: string;
  category: PlanCategory;
}
