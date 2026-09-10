// Client-side data layer for the web version.
// - All Groq calls go via Next.js API routes (key never in browser).
// - Session state persists in localStorage.
// - Classroom password is stored in sessionStorage and sent as a header.

import type { SessionData, Message, AiScoreResult, TutorReview } from "./types";
import { STEPS_ORDER } from "./types";

// ── Password / auth ───────────────────────────────────────────────────────────

const PWD_KEY = "mayumi_classroom_pwd";

export function savePassword(pwd: string) {
  sessionStorage.setItem(PWD_KEY, pwd);
}

export function getPassword(): string {
  return sessionStorage.getItem(PWD_KEY) || "";
}

function authHeaders(): Record<string, string> {
  const pwd = getPassword();
  return pwd ? { "x-classroom-password": pwd } : {};
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function apiGetMeta() {
  const res = await fetch("/api/meta");
  if (!res.ok) throw new Error("Failed to load case data.");
  return res.json();
}

export async function apiChat(
  characterKey: string,
  stepKey: string,
  language: string,
  history: { role: "user" | "assistant"; content: string }[],
  message: string
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ characterKey, stepKey, language, history, message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Chat request failed.");
  return data.reply as string;
}

export async function apiScore(
  stepKey: string,
  transcript: { sender: string; addressedTo: string | null; content: string }[]
): Promise<AiScoreResult> {
  const res = await fetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ stepKey, transcript }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Scoring failed.");
  return data as AiScoreResult;
}

export async function apiExport(session: SessionData): Promise<void> {
  const res = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(session),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Export failed.");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const cd = res.headers.get("content-disposition") || "";
  const match = cd.match(/filename="([^"]+)"/);
  a.download = match ? match[1] : "Mayumi_PBL_transcript.docx";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

// ── Session persistence (localStorage) ───────────────────────────────────────

const SESSION_KEY = "mayumi_session";

export function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SessionData;
    if (!s.language) s.language = "en";
    return s;
  } catch {
    return null;
  }
}

export function saveSession(session: SessionData): void {
  session.updatedAt = new Date().toISOString();
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function createSession(displayName: string): SessionData {
  const session: SessionData = {
    id: crypto.randomUUID(),
    displayName,
    currentStepKey: STEPS_ORDER[0],
    language: "en",
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    scores: {},
  };
  saveSession(session);
  return session;
}

export function addMessage(session: SessionData, msg: Omit<Message, "id" | "createdAt">): Message {
  const full: Message = { ...msg, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  session.messages.push(full);
  saveSession(session);
  return full;
}

export function setAiScore(session: SessionData, stepKey: string, ai: AiScoreResult): void {
  if (!session.scores[stepKey]) session.scores[stepKey] = { ai: null, tutor: null };
  session.scores[stepKey].ai = ai;
  saveSession(session);
}

export function setTutorReview(session: SessionData, stepKey: string, review: TutorReview): void {
  if (!session.scores[stepKey]) session.scores[stepKey] = { ai: null, tutor: null };
  session.scores[stepKey].tutor = review;
  saveSession(session);
}

// ── Tutor password (separate from classroom password) ─────────────────────────
const TUTOR_PWD_KEY = "mayumi_pbl_tutor_pwd";
export function saveTutorPassword(pwd: string) { sessionStorage.setItem(TUTOR_PWD_KEY, pwd); }
export function getTutorPassword(): string { return sessionStorage.getItem(TUTOR_PWD_KEY) || ""; }
