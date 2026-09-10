import { NextRequest, NextResponse } from "next/server";
import { checkTutorAuth } from "@/lib/auth";
import { getStudentProgress, getStudentChatAcrossSteps } from "@/lib/room-store";
import { buildTranscriptDocxBuffer, buildExportFilename } from "@/lib/docxExport";
import { STEPS_ORDER } from "@/lib/types";
import type { SessionData, Message } from "@/lib/types";

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const authErr = checkTutorAuth(req);
  if (authErr) return authErr;

  try {
    const { code } = await params;
    const studentId = req.nextUrl.searchParams.get("studentId");
    if (!studentId) return NextResponse.json({ error: "Missing studentId." }, { status: 400 });

    const progress = await getStudentProgress(code, studentId);
    if (!progress) return NextResponse.json({ error: "Student not found." }, { status: 404 });

    // The shared room chat is per-step; assemble this one student's own
    // messages across every step into a flat list matching solo mode's
    // SessionData shape, so the export logic stays identical either way.
    const perStep = await getStudentChatAcrossSteps(code, studentId, STEPS_ORDER);
    const messages: Message[] = STEPS_ORDER.flatMap((stepKey) =>
      (perStep[stepKey] || []).map((m) => ({
        id: m.id,
        stepKey: m.stepKey,
        sender: m.sender,
        addressedTo: m.addressedTo,
        content: m.content,
        createdAt: m.createdAt,
      }))
    );

    const session: SessionData = {
      id: progress.id,
      displayName: progress.displayName,
      currentStepKey: progress.currentStepKey,
      language: progress.language,
      startedAt: progress.startedAt,
      updatedAt: progress.updatedAt,
      messages,
      scores: progress.scores,
    };

    const uint8 = await buildTranscriptDocxBuffer(session);
    const filename = buildExportFilename(session);

    return new NextResponse(uint8 as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("GET /api/room/[code]/export error:", err);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
