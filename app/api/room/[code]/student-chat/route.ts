import { NextRequest, NextResponse } from "next/server";
import { checkTutorAuth } from "@/lib/auth";
import { getStepChat } from "@/lib/room-store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const authErr = checkTutorAuth(req);
  if (authErr) return authErr;

  try {
    const { code } = await params;
    const studentId = req.nextUrl.searchParams.get("studentId");
    const stepKey = req.nextUrl.searchParams.get("stepKey");
    if (!studentId || !stepKey) {
      return NextResponse.json({ error: "Missing studentId or stepKey." }, { status: 400 });
    }

    const fullChat = await getStepChat(code, stepKey);
    const chat = fullChat.filter((m) => m.studentId === studentId);

    return NextResponse.json({ chat });
  } catch (err) {
    console.error("GET /api/room/[code]/student-chat error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not load transcript." }, { status: 500 });
  }
}
