import { NextRequest, NextResponse } from "next/server";
import { checkTutorAuth } from "@/lib/auth";
import { getStudentProgress, saveStudentProgress } from "@/lib/room-store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const authErr = checkTutorAuth(req);
  if (authErr) return authErr;

  try {
    const { code } = await params;
    const { studentId, stepKey, score, feedback } = await req.json();
    if (!studentId || !stepKey || typeof score !== "number") {
      return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
    }

    const progress = await getStudentProgress(code, studentId);
    if (!progress) return NextResponse.json({ error: "Student not found." }, { status: 404 });

    if (!progress.scores[stepKey]) progress.scores[stepKey] = { ai: null, tutor: null };
    progress.scores[stepKey].tutor = { score, feedback: feedback || "", reviewed: true };
    await saveStudentProgress(code, progress);

    return NextResponse.json({ session: progress });
  } catch (err) {
    console.error("POST /api/room/[code]/tutor-score error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not save tutor score." }, { status: 500 });
  }
}
