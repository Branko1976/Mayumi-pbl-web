import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { buildTranscriptDocxBuffer, buildExportFilename } from "@/lib/docxExport";
import type { SessionData } from "@/lib/types";

export async function POST(req: NextRequest) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  try {
    const session = (await req.json()) as SessionData;
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
    console.error("POST /api/export error:", err);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
