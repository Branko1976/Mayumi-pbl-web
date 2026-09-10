import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getNextStep, getPreviousStep } from "@/data/case.js";
import { getStudentProgress, saveStudentProgress } from "@/lib/room-store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  try {
    const { code } = await params;
    const { studentId, direction } = await req.json();
    if (!studentId || (direction !== "next" && direction !== "previous")) {
      return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
    }

    const progress = await getStudentProgress(code, studentId);
    if (!progress) return NextResponse.json({ error: "Session not found. Please rejoin." }, { status: 404 });

    const target = direction === "next" ? getNextStep(progress.currentStepKey) : getPreviousStep(progress.currentStepKey);
    if (!target) {
      // "next" with no further step means the case is complete — keep currentStepKey as-is
      // and let the client show the completion screen; "previous" at step 0 is a no-op.
      return NextResponse.json({ session: progress, atEnd: direction === "next", atStart: direction === "previous" });
    }

    progress.currentStepKey = (target as { key: string }).key;
    await saveStudentProgress(code, progress);

    return NextResponse.json({ session: progress });
  } catch (err) {
    console.error("POST /api/room/[code]/step error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not change step." }, { status: 500 });
  }
}
