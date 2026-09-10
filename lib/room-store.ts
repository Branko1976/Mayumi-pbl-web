import { Redis } from "@upstash/redis";
import type { RoomChatMessage, RoomStudentProgress } from "@/lib/types";

// The Vercel Marketplace Redis integration (Upstash) injects credentials as
// either KV_REST_API_URL/KV_REST_API_TOKEN (legacy "Vercel KV" naming, kept
// for backward compatibility) or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN
// depending on how it was installed — support both so setup isn't fragile.
function getRedis(): Redis {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "No Redis database connected. Add a Redis integration (Upstash) to this project in the Vercel dashboard " +
        "under Storage — see DEPLOY.md. Locally, set KV_REST_API_URL / KV_REST_API_TOKEN (or the UPSTASH_REDIS_REST_* " +
        "equivalents) in .env.local."
    );
  }
  return new Redis({ url, token });
}

export function isRedisConfigured(): boolean {
  return Boolean(
    (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) &&
      (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)
  );
}

// ── Key naming ───────────────────────────────────────────────────────────────
// room:{code}                       -> JSON RoomMeta (createdAt)
// room:{code}:students              -> Redis Set of studentIds in this room
// room:{code}:student:{id}          -> JSON RoomStudentProgress (name, step,
//                                      scores — NOT chat messages)
// room:{code}:chat:{stepKey}        -> JSON array of RoomChatMessage, SHARED
//                                      by every student in the room who is
//                                      working on that step — this is what
//                                      makes "students see each other's
//                                      questions" work. Each message is
//                                      tagged with studentId/studentName so
//                                      the tutor dashboard (and AI scoring)
//                                      can filter it back down to one
//                                      student at a time.
//
// Rooms, progress, and chat all expire automatically after ROOM_TTL_SECONDS
// of inactivity, so forgotten classroom sessions don't accumulate forever on
// the free Redis tier. Any read/write refreshes the relevant key's TTL.
const ROOM_TTL_SECONDS = 60 * 60 * 24 * 3; // 3 days

export interface RoomMeta {
  code: string;
  createdAt: string;
}

function roomKey(code: string) {
  return `room:${code.toUpperCase()}`;
}
function roomStudentsKey(code: string) {
  return `room:${code.toUpperCase()}:students`;
}
function studentKey(code: string, studentId: string) {
  return `room:${code.toUpperCase()}:student:${studentId}`;
}
function stepChatKey(code: string, stepKey: string) {
  return `room:${code.toUpperCase()}:chat:${stepKey}`;
}

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid ambiguity

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

export async function createRoom(code?: string): Promise<RoomMeta> {
  const redis = getRedis();
  const finalCode = (code && code.trim()) || generateRoomCode();
  const meta: RoomMeta = { code: finalCode.toUpperCase(), createdAt: new Date().toISOString() };
  await redis.set(roomKey(finalCode), JSON.stringify(meta), { ex: ROOM_TTL_SECONDS });
  return meta;
}

export async function getRoom(code: string): Promise<RoomMeta | null> {
  const redis = getRedis();
  const raw = await redis.get<string>(roomKey(code));
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as RoomMeta);
}

export async function ensureRoom(code: string): Promise<RoomMeta> {
  const existing = await getRoom(code);
  if (existing) return existing;
  return createRoom(code);
}

// ── Per-student progress (name, current step, scores — no chat) ────────────

export async function addStudentToRoom(code: string, progress: RoomStudentProgress): Promise<void> {
  const redis = getRedis();
  await Promise.all([
    redis.sadd(roomStudentsKey(code), progress.id),
    redis.expire(roomStudentsKey(code), ROOM_TTL_SECONDS),
    redis.set(studentKey(code, progress.id), JSON.stringify(progress), { ex: ROOM_TTL_SECONDS }),
  ]);
}

export async function getStudentProgress(code: string, studentId: string): Promise<RoomStudentProgress | null> {
  const redis = getRedis();
  const raw = await redis.get<string>(studentKey(code, studentId));
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as RoomStudentProgress);
}

export async function saveStudentProgress(code: string, progress: RoomStudentProgress): Promise<void> {
  const redis = getRedis();
  progress.lastSeenAt = new Date().toISOString();
  await redis.set(studentKey(code, progress.id), JSON.stringify(progress), { ex: ROOM_TTL_SECONDS });
}

export async function listRoomStudents(code: string): Promise<RoomStudentProgress[]> {
  const redis = getRedis();
  const ids = await redis.smembers(roomStudentsKey(code));
  if (!ids || ids.length === 0) return [];
  const progresses = await Promise.all(ids.map((id) => getStudentProgress(code, id)));
  return progresses.filter((p): p is RoomStudentProgress => p !== null);
}

// ── Shared per-step chat (visible to the whole room) ────────────────────────

export async function getStepChat(code: string, stepKey: string): Promise<RoomChatMessage[]> {
  const redis = getRedis();
  const raw = await redis.get<string>(stepChatKey(code, stepKey));
  if (!raw) return [];
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  return Array.isArray(parsed) ? (parsed as RoomChatMessage[]) : [];
}

/** Appends messages to a step's shared chat and returns the full updated thread. */
export async function appendStepChat(code: string, stepKey: string, newMessages: RoomChatMessage[]): Promise<RoomChatMessage[]> {
  const redis = getRedis();
  const existing = await getStepChat(code, stepKey);
  const updated = [...existing, ...newMessages];
  await redis.set(stepChatKey(code, stepKey), JSON.stringify(updated), { ex: ROOM_TTL_SECONDS });
  return updated;
}

/** All of one student's own messages across every step, keyed by stepKey — used for scoring and export. */
export async function getStudentChatAcrossSteps(code: string, studentId: string, stepKeys: string[]): Promise<Record<string, RoomChatMessage[]>> {
  const allSteps = await Promise.all(stepKeys.map((k) => getStepChat(code, k)));
  const result: Record<string, RoomChatMessage[]> = {};
  stepKeys.forEach((k, i) => {
    result[k] = allSteps[i].filter((m) => m.studentId === studentId);
  });
  return result;
}
