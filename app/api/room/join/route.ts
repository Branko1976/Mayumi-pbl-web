import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { ensureRoom, addStudentToRoom, isRedisConfigured } from "@/lib/room-store";
import { STEPS_ORDER } from "@/lib/types";
import type { RoomStudentProgress } from "@/lib/types";

export async function POST(req: NextRequest) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  if (!isRedisConfigured()) {
    return NextResponse.json(
      { error: "This app isn't connected to a live-session database yet. Ask your tutor to finish setup (see DEPLOY.md)." },
      { status: 500 }
    );
  }

  try {
    const { code, displayName, language } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Missing session code." }, { status: 400 });
    }

    const room = await ensureRoom(code);
    const now = new Date().toISOString();
    const progress: RoomStudentProgress = {
      id: crypto.randomUUID(),
      displayName: displayName || "Student",
      currentStepKey: STEPS_ORDER[0],
      language: language || "en",
      startedAt: now,
      updatedAt: now,
      lastSeenAt: now,
      scores: {},
    };
    await addStudentToRoom(room.code, progress);

    return NextResponse.json({ room, session: progress });
  } catch (err) {
    console.error("POST /api/room/join error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not join room." }, { status: 500 });
  }
}
