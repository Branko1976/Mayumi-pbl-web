import Groq from "groq-sdk";
import {
  getCharacter,
  getStepByKey,
  getAllFactsUpToStep,
  CASE_META,
} from "@/data/case.js";
import { getLanguageLabel } from "@/data/languages.js";

export const DEFAULT_MODEL = "openai/gpt-oss-120b";

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY environment variable is not set.");
  return new Groq({ apiKey });
}

export function buildRoleplaySystemPrompt(
  characterKey: string,
  stepKey: string,
  language: string
): string {
  const character = getCharacter(characterKey);
  const step = getStepByKey(stepKey);
  if (!character || !step) throw new Error(`Unknown character or step.`);

  const facts = getAllFactsUpToStep(stepKey);
  const languageLabel = getLanguageLabel(language || "en");

  return [
    `You are role-playing as a character in a medical education simulation for undergraduate medical students.`,
    `CASE: "${CASE_META.title}" — ${CASE_META.subtitle}.`,
    ``,
    `CHARACTER YOU ARE PLAYING: ${character.name} (${character.role}).`,
    character.persona,
    `Speech style: ${character.speechStyle}`,
    ``,
    `CURRENT SCENE / STEP: ${step.label}`,
    step.settingNote,
    ``,
    `FACTS YOU MAY DRAW ON (everything revealed in the case up to and including this step — reveal naturally in character, not all at once):`,
    ...facts.map((f: string) => `- ${f}`),
    ``,
    `LANGUAGE: Respond ONLY in ${languageLabel}. Use natural, fluent, conversationally appropriate ${languageLabel} for this character — not a stiff translation. Clinical terms may stay as-is.`,
    ``,
    `STRICT RULES:`,
    `1. Stay completely in character. Never break character or mention being an AI.`,
    `2. Do NOT reveal facts from later steps. If asked about something not yet established, respond as the character realistically would.`,
    `3. Do NOT provide medical diagnoses or textbook explanations — you are a character, not a teacher.`,
    `4. Keep responses concise — 1-4 sentences, like a real conversation turn.`,
    `5. If the student uses poor interview technique, react realistically (e.g. the patient may become more guarded or agitated).`,
    `6. Never discuss the rubric or scoring.`,
  ].join("\n");
}

export async function roleplayReply(
  characterKey: string,
  stepKey: string,
  language: string,
  history: { role: "user" | "assistant"; content: string }[],
  studentMessage: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  const groq = getClient();
  const systemPrompt = buildRoleplaySystemPrompt(characterKey, stepKey, language);
  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: studentMessage },
    ],
    temperature: 0.8,
    max_tokens: 300,
  });
  return completion.choices[0]?.message?.content?.trim() || "...";
}

export async function suggestScore(
  stepKey: string,
  transcript: { sender: string; addressedTo: string | null; content: string }[],
  model: string = DEFAULT_MODEL
): Promise<object> {
  const groq = getClient();
  const step = getStepByKey(stepKey);
  if (!step) throw new Error(`Unknown step ${stepKey}`);

  const system = [
    `You are an expert medical education assessor evaluating a student's simulated patient interview.`,
    `CASE: "${CASE_META.title}". STEP: ${step.label}`,
    step.settingNote,
    ``,
    `LEARNING OBJECTIVES:`,
    ...(step.tutorObjectives as string[]).map((o: string) => `- ${o}`),
    ``,
    `RUBRIC CRITERIA:`,
    ...(step.rubric as string[]).map((r: string, i: number) => `${i + 1}. ${r}`),
    ``,
    `Assess ONLY the student's messages. The transcript may be in a language other than English — read it in whatever language it's in, but write ALL your output in English.`,
    `Respond ONLY with valid JSON, no markdown fences:`,
    `{ "rubric": [{"criterion":string,"met":true|false|"partial","note":string}], "score":number, "feedback":string, "strengths":[string], "areas_for_improvement":[string] }`,
  ].join("\n");

  const transcriptText = transcript
    .map((m) =>
      m.sender === "student"
        ? `STUDENT (to ${m.addressedTo || "scene"}): ${m.content}`
        : `${m.sender.toUpperCase()}: ${m.content}`
    )
    .join("\n");

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Transcript:\n\n${transcriptText || "(No messages exchanged.)"}` },
    ],
    temperature: 0.3,
    max_tokens: 900,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return {
      rubric: [],
      score: null,
      feedback: "AI scorer returned an unparseable response. Please score this step manually.",
      strengths: [],
      areas_for_improvement: [],
    };
  }
}
