import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { suggestScore, DEFAULT_MODEL } from "@/lib/llm";

export async function POST(req: NextRequest) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  try {
    const { stepKey, transcript } = await req.json();
    if (!stepKey) return NextResponse.json({ error: "Missing stepKey." }, { status: 400 });

    const result = await suggestScore(
      stepKey,
      transcript || [],
      process.env.GROQ_MODEL || DEFAULT_MODEL
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/score error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scoring failed." },
      { status: 500 }
    );
  }
}
