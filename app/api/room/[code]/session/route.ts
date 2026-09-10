import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getStudentProgress, saveStudentProgress } from "@/lib/room-store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  try {
    const { code } = await params;
    const studentId = req.nextUrl.searchParams.get("studentId");
    if (!studentId) return NextResponse.json({ error: "Missing studentId." }, { status: 400 });

    const progress = await getStudentProgress(code, studentId);
    if (!progress) return NextResponse.json({ error: "Session not found." }, { status: 404 });

    // Touch lastSeenAt so the tutor dashboard's "online" indicator stays accurate
    // even on a quiet poll with no other activity.
    await saveStudentProgress(code, progress);

    return NextResponse.json({ session: progress });
  } catch (err) {
    console.error("GET /api/room/[code]/session error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not load session." }, { status: 500 });
  }
}
