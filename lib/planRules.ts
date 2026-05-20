import { PlanItem } from "./types";

export const PLAN_RULES: Record<string, PlanItem[]> = {
  "Lumbar disc herniation": [
    { id: "lmri", label: "Lumbar MRI (L-spine MRI)", category: "imaging" },
    {
      id: "nsaids",
      label: "NSAIDs — e.g., Diclofenac 50mg BID × 2wks",
      category: "medication",
    },
    {
      id: "muscle-relaxant",
      label: "Muscle relaxant — e.g., Tizanidine 2mg TID",
      category: "medication",
    },
    {
      id: "pt",
      label: "Physical therapy — lumbar stabilization exercise",
      category: "therapy",
    },
    {
      id: "snrb",
      label: "Selective nerve root block (R. L5) 고려",
      category: "procedure",
    },
    {
      id: "fu2w",
      label: "2-week outpatient follow-up",
      category: "followup",
    },
    {
      id: "redflag",
      label: "Red flag symptom education (bladder/bowel dysfunction)",
      category: "education",
    },
  ],
  "Lumbar spinal stenosis": [
    { id: "lmri2", label: "Lumbar MRI (L-spine MRI)", category: "imaging" },
    {
      id: "xray",
      label: "Standing lumbar X-ray (AP/Lateral/Flexion-Extension)",
      category: "imaging",
    },
    {
      id: "conservative",
      label: "Conservative treatment — activity modification & exercise",
      category: "therapy",
    },
    {
      id: "nsaids2",
      label: "NSAIDs / analgesics",
      category: "medication",
    },
    {
      id: "esi",
      label: "Epidural steroid injection 고려",
      category: "procedure",
    },
    {
      id: "surgical",
      label: "Surgical consultation if progressive neurologic deficit",
      category: "procedure",
    },
    {
      id: "fu4w",
      label: "4-week outpatient follow-up",
      category: "followup",
    },
  ],
  "Peripheral neuropathy": [
    {
      id: "ncs",
      label: "Nerve conduction study / EMG",
      category: "imaging",
    },
    {
      id: "bloodwork",
      label: "CBC, HbA1c, Vit B12, folate, TSH, LFT",
      category: "imaging",
    },
    {
      id: "vitb12",
      label: "Vitamin B12 supplementation",
      category: "medication",
    },
    {
      id: "neuro-ref",
      label: "Neurology referral",
      category: "followup",
    },
    {
      id: "glucose",
      label: "Glucose control optimization (if DM)",
      category: "therapy",
    },
  ],
  "Myofascial pain syndrome": [
    {
      id: "trigger",
      label: "Trigger point injection",
      category: "procedure",
    },
    {
      id: "heat",
      label: "Heat therapy & stretching program",
      category: "therapy",
    },
    {
      id: "nsaids3",
      label: "NSAIDs / muscle relaxants",
      category: "medication",
    },
    {
      id: "posture",
      label: "Posture & ergonomics education",
      category: "education",
    },
    {
      id: "fu4w2",
      label: "4-week outpatient follow-up",
      category: "followup",
    },
  ],
};

export function getPlansForDiagnosis(diagnosis: string): PlanItem[] {
  const exact = PLAN_RULES[diagnosis];
  if (exact) return exact;

  const key = Object.keys(PLAN_RULES).find((k) =>
    diagnosis.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(diagnosis.toLowerCase())
  );
  return key ? PLAN_RULES[key] : [];
}

export const CATEGORY_STYLES: Record<
  string,
  { bg: string; border: string; text: string; dot: string }
> = {
  imaging: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  medication: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  therapy: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  procedure: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  followup: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
  education: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
};

export const CATEGORY_LABELS: Record<string, string> = {
  imaging: "검사",
  medication: "투약",
  therapy: "치료",
  procedure: "시술/수술",
  followup: "추적관찰",
  education: "환자 교육",
};
