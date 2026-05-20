export type AIProvider = "mock" | "openai" | "gemini" | "claude";

export interface AIRawResult {
  soap: {
    subjective: string;
    objective: string;
  };
  differentialDiagnoses: {
    name: string;
    score: number;
    evidence: string[];
  }[];
  treatmentPlan: {
    label: string;
    category: string;
  }[];
}

export const PROVIDER_INFO: Record<
  AIProvider,
  {
    label: string;
    shortLabel: string;
    color: string;
    bg: string;
    border: string;
    badgeBg: string;
    model: string;
  }
> = {
  mock: {
    label: "Rule-based (Mock)",
    shortLabel: "Mock",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-300",
    badgeBg: "bg-slate-100 text-slate-600 border-slate-300",
    model: "Rule Engine v1",
  },
  openai: {
    label: "ChatGPT (OpenAI)",
    shortLabel: "ChatGPT",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    badgeBg: "bg-emerald-100 text-emerald-700 border-emerald-300",
    model: "gpt-4o",
  },
  gemini: {
    label: "Gemini (Google)",
    shortLabel: "Gemini",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
    badgeBg: "bg-blue-100 text-blue-700 border-blue-300",
    model: "gemini-1.5-pro",
  },
  claude: {
    label: "Claude (Anthropic)",
    shortLabel: "Claude",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-300",
    badgeBg: "bg-violet-100 text-violet-700 border-violet-300",
    model: "claude-opus-4-7",
  },
};

export const CLINICAL_SYSTEM_PROMPT = `You are a clinical decision support AI assistant. Analyze the provided clinical conversation and return ONLY a valid JSON object — no markdown, no code blocks, no explanation text.

Required JSON structure:
{
  "soap": {
    "subjective": "Patient-reported symptoms and history in clinical language",
    "objective": "Physical examination findings and test results mentioned"
  },
  "differentialDiagnoses": [
    {
      "name": "Diagnosis name in English",
      "score": 76,
      "evidence": ["Supporting finding 1", "Supporting finding 2"]
    }
  ],
  "treatmentPlan": [
    {
      "label": "Specific management item",
      "category": "imaging"
    }
  ]
}

Rules:
- All scores must be integers that sum to exactly 100
- Provide 3–5 differential diagnoses ordered by likelihood (highest first)
- Provide 5–8 treatment plan items tailored to the leading diagnosis
- category must be exactly one of: imaging, medication, therapy, procedure, followup, education
- All text in English
- Do NOT wrap output in markdown or code blocks
- Output raw JSON only`;

export const LOCALSTORAGE_KEYS: Record<AIProvider, string> = {
  mock: "",
  openai: "medai_openai_key",
  gemini: "medai_gemini_key",
  claude: "medai_claude_key",
};

export const DIAGNOSIS_ONLY_PROMPT = `You are a clinical decision support AI. Based on the clinical findings below, generate differential diagnoses. Return ONLY a valid JSON object — no markdown, no explanation.

{
  "differentialDiagnoses": [
    {
      "name": "Diagnosis name in English",
      "score": 76,
      "evidence": ["Specific supporting finding 1", "Specific supporting finding 2"]
    }
  ]
}

Rules:
- 3–5 diagnoses, ordered by likelihood (highest first)
- Scores must be integers summing to exactly 100
- Evidence must reference specific clinical findings provided
- All text in English
- Raw JSON only`;

export const PLAN_ONLY_PROMPT = `You are a clinical decision support AI. For the confirmed diagnosis and patient context below, generate a detailed evidence-based management plan. Return ONLY a valid JSON object — no markdown, no explanation.

{
  "treatmentPlan": [
    {
      "label": "Specific management item (include drug name/dose/duration where relevant)",
      "category": "imaging"
    }
  ]
}

Rules:
- 5–8 management items, evidence-based and specific
- category must be exactly one of: imaging, medication, therapy, procedure, followup, education
- Include specific drug names, doses, imaging modalities, referral types where appropriate
- All text in English
- Raw JSON only`;
