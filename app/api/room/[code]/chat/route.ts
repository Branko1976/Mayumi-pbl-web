import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { roleplayReply, DEFAULT_MODEL } from "@/lib/llm";
import { getStepByKey } from "@/data/case.js";
import { getStudentProgress, saveStudentProgress, getStepChat, appendStepChat } from "@/lib/room-store";
import type { RoomChatMessage, CharacterKey } from "@/lib/types";

// GET — fetch the shared chat thread for a step (polled by the room's
// students so everyone can see each other's questions and the characters'
// replies, live).
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  try {
    const { code } = await params;
    const stepKey = req.nextUrl.searchParams.get("stepKey");
    if (!stepKey) return NextResponse.json({ error: "Missing stepKey." }, { status: 400 });

    const chat = await getStepChat(code, stepKey);
    return NextResponse.json({ chat });
  } catch (err) {
    console.error("GET /api/room/[code]/chat error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not load chat." }, { status: 500 });
  }
}

// POST — send a message to a character; appended to the step's shared chat.

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  try {
    const { code } = await params;
    const { studentId, characterKey, message } = await req.json();
    if (!studentId || !characterKey || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const progress = await getStudentProgress(code, studentId);
    if (!progress) return NextResponse.json({ error: "Session not found. Please rejoin." }, { status: 404 });

    const step = getStepByKey(progress.currentStepKey);
    if (!step) return NextResponse.json({ error: "Invalid step." }, { status: 400 });

    const availableChars = step.availableCharacters as string[];
    if (!availableChars.includes(characterKey)) {
      return NextResponse.json({ error: `Character '${characterKey}' is not available at this step.` }, { status: 400 });
    }

    // The character's conversation history is SHARED across the whole room for
    // this step — every student's turns with this character feed one running
    // "group interview" memory, which is also what lets students see each
    // other's questions in the shared chat feed.
    const existingChat = await getStepChat(code, progress.currentStepKey);
    const history = existingChat
      .filter((m) => m.characterKey === characterKey)
      .map((m) => ({ role: (m.sender === "student" ? "user" : "assistant") as "user" | "assistant", content: m.content }));

    const reply = await roleplayReply(
      characterKey,
      progress.currentStepKey,
      progress.language || "en",
      history,
      message,
      process.env.GROQ_MODEL || DEFAULT_MODEL
    );

    const now = new Date().toISOString();
    const studentMsg: RoomChatMessage = {
      id: crypto.randomUUID(),
      studentId: progress.id,
      studentName: progress.displayName,
      stepKey: progress.currentStepKey,
      characterKey: characterKey as CharacterKey,
      sender: "student",
      addressedTo: characterKey as CharacterKey,
      content: message,
      createdAt: now,
    };
    const replyMsg: RoomChatMessage = {
      id: crypto.randomUUID(),
      studentId: progress.id,
      studentName: progress.displayName,
      stepKey: progress.currentStepKey,
      characterKey: characterKey as CharacterKey,
      sender: characterKey as CharacterKey,
      addressedTo: null,
      content: reply,
      createdAt: new Date().toISOString(),
    };
    const updatedChat = await appendStepChat(code, progress.currentStepKey, [studentMsg, replyMsg]);

    progress.updatedAt = new Date().toISOString();
    await saveStudentProgress(code, progress);

    return NextResponse.json({ reply, chat: updatedChat, session: progress });
  } catch (err) {
    console.error("POST /api/room/[code]/chat error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Chat request failed." }, { status: 500 });
  }
}
