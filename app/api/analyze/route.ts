import { NextRequest, NextResponse } from "next/server";
import {
  CLINICAL_SYSTEM_PROMPT,
  DIAGNOSIS_ONLY_PROMPT,
  PLAN_ONLY_PROMPT,
  AIRawResult,
} from "@/lib/aiProviders";

type AnalyzeMode = "full" | "diagnose" | "plan";

interface RequestBody {
  mode?: AnalyzeMode;
  transcript?: string;
  soap?: { subjective: string; objective: string };
  diagnosis?: string;
  provider: string;
  apiKey: string;
}

function extractJSON(text: string): AIRawResult {
  const stripped = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(stripped);
}

function buildUserContent(mode: AnalyzeMode, body: RequestBody): string {
  if (mode === "full") {
    return `Clinical transcript:\n\n${body.transcript ?? ""}`;
  }
  if (mode === "diagnose") {
    return `Subjective (patient-reported):\n${body.soap?.subjective ?? ""}\n\nObjective (examination findings):\n${body.soap?.objective ?? ""}`;
  }
  // mode === 'plan'
  return `Confirmed diagnosis: ${body.diagnosis ?? ""}\n\nSubjective:\n${body.soap?.subjective ?? ""}\n\nObjective:\n${body.soap?.objective ?? ""}`;
}

function getSystemPrompt(mode: AnalyzeMode): string {
  if (mode === "full") return CLINICAL_SYSTEM_PROMPT;
  if (mode === "diagnose") return DIAGNOSIS_ONLY_PROMPT;
  return PLAN_ONLY_PROMPT;
}

async function callOpenAI(
  systemPrompt: string,
  userContent: string,
  apiKey: string
): Promise<AIRawResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `OpenAI API error (${res.status})`);
  }

  const data = await res.json();
  return extractJSON(data.choices[0].message.content);
}

async function callGemini(
  systemPrompt: string,
  userContent: string,
  apiKey: string
): Promise<AIRawResult> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt + "\n\n" + userContent }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Gemini API error (${res.status})`);
  }

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return extractJSON(text);
}

async function callClaude(
  systemPrompt: string,
  userContent: string,
  apiKey: string
): Promise<AIRawResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-7",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Claude API error (${res.status})`);
  }

  const data = await res.json();
  const text: string = data?.content?.[0]?.text ?? "";
  return extractJSON(text);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { provider, apiKey, mode = "full" } = body;

    if (provider !== "mock" && !apiKey?.trim()) {
      return NextResponse.json(
        { error: "API key is required for this provider" },
        { status: 400 }
      );
    }

    const systemPrompt = getSystemPrompt(mode);
    const userContent = buildUserContent(mode, body);

    let result: AIRawResult;

    switch (provider) {
      case "openai":
        result = await callOpenAI(systemPrompt, userContent, apiKey);
        break;
      case "gemini":
        result = await callGemini(systemPrompt, userContent, apiKey);
        break;
      case "claude":
        result = await callClaude(systemPrompt, userContent, apiKey);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
