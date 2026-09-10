import { NextRequest, NextResponse } from "next/server";
import { checkTutorAuth } from "@/lib/auth";
import { isRedisConfigured } from "@/lib/room-store";

export async function GET(req: NextRequest) {
  const authErr = checkTutorAuth(req);
  if (authErr) return authErr;

  return NextResponse.json({ ok: true, redisConfigured: isRedisConfigured() });
}
