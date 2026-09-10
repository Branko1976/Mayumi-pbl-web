import { NextRequest, NextResponse } from "next/server";
import { checkTutorAuth } from "@/lib/auth";
import { createRoom, isRedisConfigured } from "@/lib/room-store";

export async function POST(req: NextRequest) {
  const authErr = checkTutorAuth(req);
  if (authErr) return authErr;

  if (!isRedisConfigured()) {
    return NextResponse.json(
      { error: "No Redis database connected. Add a Redis integration to this project in the Vercel dashboard (Storage tab) — see DEPLOY.md." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const room = await createRoom(body?.code);
    return NextResponse.json({ room });
  } catch (err) {
    console.error("POST /api/room/create error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not create room." }, { status: 500 });
  }
}
