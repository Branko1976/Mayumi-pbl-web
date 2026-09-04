import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { roleplayReply, DEFAULT_MODEL } from "@/lib/llm";
import { getStepByKey } from "@/data/case.js";

export async function POST(req: NextRequest) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  try {
    const { characterKey, stepKey, language, history, message } = await req.json();

    if (!characterKey || !stepKey || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const step = getStepByKey(stepKey);
    if (!step) return NextResponse.json({ error: "Invalid step." }, { status: 400 });

    const availableChars = step.availableCharacters as string[];
    if (!availableChars.includes(characterKey)) {
      return NextResponse.json(
        { error: `Character '${characterKey}' is not available at this step.` },
        { status: 400 }
      );
    }

    const reply = await roleplayReply(
      characterKey,
      stepKey,
      language || "en",
      history || [],
      message,
      process.env.GROQ_MODEL || DEFAULT_MODEL
    );

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat request failed." },
      { status: 500 }
    );
  }
}
