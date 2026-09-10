import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { suggestScore, DEFAULT_MODEL } from "@/lib/llm";
import { getStudentProgress, saveStudentProgress, getStepChat } from "@/lib/room-store";
import type { AiScoreResult } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  try {
    const { code } = await params;
    const { studentId } = await req.json();
    if (!studentId) return NextResponse.json({ error: "Missing studentId." }, { status: 400 });

    const progress = await getStudentProgress(code, studentId);
    if (!progress) return NextResponse.json({ error: "Session not found. Please rejoin." }, { status: 404 });

    const stepKey = progress.currentStepKey;
    // The room's chat for this step is shared, but scoring is per-student —
    // only grade this student's own questions and the replies they received.
    const fullChat = await getStepChat(code, stepKey);
    const transcript = fullChat
      .filter((m) => m.studentId === studentId)
      .map((m) => ({ sender: m.sender, addressedTo: m.addressedTo, content: m.content }));

    const result = (await suggestScore(stepKey, transcript, process.env.GROQ_MODEL || DEFAULT_MODEL)) as AiScoreResult;

    if (!progress.scores[stepKey]) progress.scores[stepKey] = { ai: null, tutor: null };
    progress.scores[stepKey].ai = result;
    await saveStudentProgress(code, progress);

    return NextResponse.json({ result, session: progress });
  } catch (err) {
    console.error("POST /api/room/[code]/score error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Scoring failed." }, { status: 500 });
  }
}
