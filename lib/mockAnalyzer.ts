import { DiagnosisCandidate, SOAPData } from "./types";

export const SAMPLE_TRANSCRIPT = `환자: 2주 전부터 허리 통증이 있고 오른쪽 종아리까지 저립니다.
의사: 보행 시 통증이 심해지나요?
환자: 오래 걸으면 더 아프고 쉬면 조금 좋아집니다.
의사: SLR test positive on the right side. Ankle dorsiflexion weakness grade 4. Sensory decrease on L5 dermatome.`;

interface ScoringRule {
  keywords: string[];
  points: Partial<Record<string, number>>;
}

const SCORING_RULES: ScoringRule[] = [
  {
    keywords: ["slr", "straight leg"],
    points: { "Lumbar disc herniation": 30 },
  },
  {
    keywords: ["dorsiflexion", "발등 굴곡"],
    points: { "Lumbar disc herniation": 15, "Peripheral neuropathy": 5 },
  },
  {
    keywords: ["l4", "l5", "s1", "dermatome"],
    points: { "Lumbar disc herniation": 15 },
  },
  {
    keywords: ["저림", "저립니다", "numbness", "tingling", "radiating"],
    points: {
      "Lumbar disc herniation": 10,
      "Lumbar spinal stenosis": 5,
      "Peripheral neuropathy": 8,
    },
  },
  {
    keywords: ["방사통", "radiculopathy", "radiation"],
    points: { "Lumbar disc herniation": 20 },
  },
  {
    keywords: ["걸으면", "보행", "gait", "walking", "claudication"],
    points: { "Lumbar spinal stenosis": 25 },
  },
  {
    keywords: ["쉬면", "rest", "sitting", "앉으면"],
    points: { "Lumbar spinal stenosis": 20 },
  },
  {
    keywords: ["stenosis", "협착"],
    points: { "Lumbar spinal stenosis": 30 },
  },
  {
    keywords: ["sensory", "감각 저하", "감각"],
    points: { "Peripheral neuropathy": 12, "Lumbar disc herniation": 8 },
  },
  {
    keywords: ["weakness", "grade", "약화"],
    points: { "Peripheral neuropathy": 8, "Lumbar disc herniation": 8 },
  },
  {
    keywords: ["허리", "요통", "low back", "back pain", "통증"],
    points: {
      "Lumbar disc herniation": 5,
      "Lumbar spinal stenosis": 3,
      "Myofascial pain syndrome": 8,
    },
  },
  {
    keywords: ["myofascial", "trigger point", "근막"],
    points: { "Myofascial pain syndrome": 30 },
  },
];

const DIAGNOSES = [
  "Lumbar disc herniation",
  "Lumbar spinal stenosis",
  "Peripheral neuropathy",
  "Myofascial pain syndrome",
];

const EVIDENCE_MAP: Record<string, Array<{ keywords: string[]; text: string }>> = {
  "Lumbar disc herniation": [
    { keywords: ["slr", "straight leg"], text: "SLR test positive" },
    { keywords: ["dorsiflexion", "발등"], text: "Ankle dorsiflexion weakness" },
    { keywords: ["l5", "dermatome"], text: "L5 dermatomal sensory change" },
    { keywords: ["저림", "numbness", "tingling"], text: "Unilateral radicular numbness" },
    { keywords: ["방사통", "radiating"], text: "Radicular pain pattern" },
    { keywords: ["허리", "요통", "back pain"], text: "Low back pain" },
  ],
  "Lumbar spinal stenosis": [
    { keywords: ["걸으면", "보행", "walking", "gait"], text: "Neurogenic claudication (worse with walking)" },
    { keywords: ["쉬면", "rest"], text: "Symptom relief with rest" },
    { keywords: ["저림", "numbness"], text: "Lower extremity numbness" },
    { keywords: ["허리", "요통"], text: "Low back pain" },
  ],
  "Peripheral neuropathy": [
    { keywords: ["sensory", "감각"], text: "Sensory deficit" },
    { keywords: ["weakness", "grade", "약화"], text: "Distal motor weakness" },
    { keywords: ["저림", "numbness", "tingling"], text: "Distal numbness/tingling" },
  ],
  "Myofascial pain syndrome": [
    { keywords: ["허리", "요통", "back pain", "통증"], text: "Regional back pain without radiculopathy" },
    { keywords: ["trigger", "근막"], text: "Trigger point tenderness" },
  ],
};

function extractSubjective(transcript: string): string {
  const lines = transcript
    .split("\n")
    .filter((l) => l.match(/^(환자|Patient)\s*:/i))
    .map((l) => l.replace(/^(환자|Patient)\s*:\s*/i, "").trim());
  return lines.join(" ") || "";
}

function extractObjective(transcript: string): string {
  const lines = transcript
    .split("\n")
    .filter((l) => l.match(/^(의사|Doctor|Physician)\s*:/i))
    .map((l) => l.replace(/^(의사|Doctor|Physician)\s*:\s*/i, "").trim());

  const examFindings = lines.filter((l) => {
    const lower = l.toLowerCase();
    return (
      lower.includes("test") ||
      lower.includes("weakness") ||
      lower.includes("grade") ||
      lower.includes("positive") ||
      lower.includes("negative") ||
      lower.includes("sensory") ||
      lower.includes("reflex") ||
      lower.includes("dermatome") ||
      lower.includes("rom") ||
      lower.includes("range")
    );
  });

  return examFindings.join(" ") || lines.join(" ") || "";
}

function getEvidenceForDiagnosis(diagnosisName: string, lower: string): string[] {
  const rules = EVIDENCE_MAP[diagnosisName] || [];
  return rules
    .filter((r) => r.keywords.some((kw) => lower.includes(kw)))
    .map((r) => r.text);
}

export function analyzeTranscript(transcript: string): {
  soap: SOAPData;
  candidates: DiagnosisCandidate[];
} {
  const lower = transcript.toLowerCase();

  const rawScores: Record<string, number> = {};
  DIAGNOSES.forEach((d) => (rawScores[d] = 0));

  for (const rule of SCORING_RULES) {
    const matched = rule.keywords.some((kw) => lower.includes(kw));
    if (matched) {
      for (const [diag, pts] of Object.entries(rule.points)) {
        if (rawScores[diag] !== undefined && pts !== undefined) {
          rawScores[diag] += pts;
        }
      }
    }
  }

  const total = Object.values(rawScores).reduce((a, b) => a + b, 0) || 1;

  const candidates: DiagnosisCandidate[] = DIAGNOSES.map((name) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    score: Math.round((rawScores[name] / total) * 100),
    evidence: getEvidenceForDiagnosis(name, lower),
  }))
    .sort((a, b) => b.score - a.score)
    .filter((c) => c.score > 0);

  const subjective = extractSubjective(transcript);
  const objective = extractObjective(transcript);

  const soap: SOAPData = {
    subjective: subjective || "No subjective information extracted.",
    objective: objective || "No objective findings extracted.",
    assessment: "",
    plan: "",
  };

  return { soap, candidates };
}
