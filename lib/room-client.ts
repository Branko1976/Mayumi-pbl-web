// Client-side data layer for the live multi-user classroom mode.
// Unlike lib/client.ts (solo mode, session lives only in localStorage), here
// the server (via Redis) is the source of truth. Chat is SHARED per room+step
// (everyone working on a step sees the same conversation) while each
// student's own progress/scores stay separate. A local identity cache (per
// room+studentId) lets a page refresh resume immediately.

import { getPassword } from "./client";
import type { RoomStudentProgress, RoomChatMessage, AiScoreResult } from "./types";

function classroomHeaders(): Record<string, string> {
  const pwd = getPassword();
  return pwd ? { "x-classroom-password": pwd } : {};
}

// ── Tutor password (separate from the classroom password) ──────────────────

const TUTOR_PWD_KEY = "meth_pbl_tutor_pwd";

export function saveTutorPassword(pwd: string) {
  sessionStorage.setItem(TUTOR_PWD_KEY, pwd);
}
export function getTutorPassword(): string {
  return sessionStorage.getItem(TUTOR_PWD_KEY) || "";
}
function tutorHeaders(): Record<string, string> {
  const pwd = getTutorPassword();
  return pwd ? { "x-tutor-password": pwd } : {};
}

// ── Local resume cache (per room+student) ───────────────────────────────────

function localKey(code: string) {
  return `meth_pbl_room_${code.toUpperCase()}_student`;
}
export function saveLocalRoomIdentity(code: string, studentId: string, displayName: string) {
  localStorage.setItem(localKey(code), JSON.stringify({ studentId, displayName }));
}
export function loadLocalRoomIdentity(code: string): { studentId: string; displayName: string } | null {
  try {
    const raw = localStorage.getItem(localKey(code));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function clearLocalRoomIdentity(code: string) {
  localStorage.removeItem(localKey(code));
}

// ── Student-facing room API ─────────────────────────────────────────────────

export async function apiJoinRoom(code: string, displayName: string, language: string) {
  const res = await fetch("/api/room/join", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...classroomHeaders() },
    body: JSON.stringify({ code, displayName, language }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not join session.");
  return data as { room: { code: string }; session: RoomStudentProgress };
}

export async function apiGetRoomSession(code: string, studentId: string) {
  const res = await fetch(`/api/room/${code}/session?studentId=${encodeURIComponent(studentId)}`, {
    headers: classroomHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not load session.");
  return data.session as RoomStudentProgress;
}

/** Fetches the shared chat thread for a step — every student on that step sees the same messages. */
export async function apiGetStepChat(code: string, stepKey: string) {
  const res = await fetch(`/api/room/${code}/chat?stepKey=${encodeURIComponent(stepKey)}`, {
    headers: classroomHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not load chat.");
  return data.chat as RoomChatMessage[];
}

export async function apiRoomChat(code: string, studentId: string, characterKey: string, message: string) {
  const res = await fetch(`/api/room/${code}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...classroomHeaders() },
    body: JSON.stringify({ studentId, characterKey, message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Chat request failed.");
  return data as { reply: string; chat: RoomChatMessage[]; session: RoomStudentProgress };
}

export async function apiRoomScore(code: string, studentId: string) {
  const res = await fetch(`/api/room/${code}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...classroomHeaders() },
    body: JSON.stringify({ studentId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Scoring failed.");
  return data as { result: AiScoreResult; session: RoomStudentProgress };
}

export async function apiRoomStep(code: string, studentId: string, direction: "next" | "previous") {
  const res = await fetch(`/api/room/${code}/step`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...classroomHeaders() },
    body: JSON.stringify({ studentId, direction }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not change step.");
  return data as { session: RoomStudentProgress; atEnd?: boolean; atStart?: boolean };
}

// ── Tutor-facing room API ───────────────────────────────────────────────────

export async function apiTutorCreateRoom(code?: string) {
  const res = await fetch("/api/room/create", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...tutorHeaders() },
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not create room.");
  return data.room as { code: string; createdAt: string };
}

export async function apiTutorGetState(code: string) {
  const res = await fetch(`/api/room/${code}/state`, { headers: tutorHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not load room state.");
  return data as { room: { code: string; createdAt: string }; students: RoomStudentProgress[] };
}

/** Tutor-only: one student's own messages for a step (the shared room chat, filtered down to just them). */
export async function apiTutorGetStudentChat(code: string, studentId: string, stepKey: string) {
  const res = await fetch(`/api/room/${code}/student-chat?studentId=${encodeURIComponent(studentId)}&stepKey=${encodeURIComponent(stepKey)}`, {
    headers: tutorHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not load transcript.");
  return data.chat as RoomChatMessage[];
}

export async function apiTutorSetScore(code: string, studentId: string, stepKey: string, score: number, feedback: string) {
  const res = await fetch(`/api/room/${code}/tutor-score`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...tutorHeaders() },
    body: JSON.stringify({ studentId, stepKey, score, feedback }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not save score.");
  return data.session as RoomStudentProgress;
}

export function tutorExportUrl(code: string, studentId: string): string {
  return `/api/room/${code}/export?studentId=${encodeURIComponent(studentId)}`;
}

export async function downloadTutorExport(code: string, studentId: string, suggestedName: string) {
  const res = await fetch(tutorExportUrl(code, studentId), { headers: tutorHeaders() });
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
  a.download = match ? match[1] : suggestedName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}
