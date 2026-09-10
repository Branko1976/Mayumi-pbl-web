import { NextRequest, NextResponse } from "next/server";
import { checkTutorAuth } from "@/lib/auth";
import { getRoom, listRoomStudents } from "@/lib/room-store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const authErr = checkTutorAuth(req);
  if (authErr) return authErr;

  try {
    const { code } = await params;
    const room = await getRoom(code);
    if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });

    const students = await listRoomStudents(code);
    students.sort((a, b) => a.displayName.localeCompare(b.displayName));

    return NextResponse.json({ room, students });
  } catch (err) {
    console.error("GET /api/room/[code]/state error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not load room state." }, { status: 500 });
  }
}
