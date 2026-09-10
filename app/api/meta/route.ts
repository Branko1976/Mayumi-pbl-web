import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { CASE_META, STEPS } from "@/data/case.js";
import { LANGUAGES } from "@/data/languages.js";

export async function GET(req: NextRequest) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  return NextResponse.json({
    meta: CASE_META,
    steps: (STEPS as { key: string; order: number; label: string; settingNote: string; availableCharacters: string[] }[]).map((s) => ({
      key: s.key,
      order: s.order,
      label: s.label,
      settingNote: s.settingNote,
      availableCharacters: s.availableCharacters,
    })),
    languages: LANGUAGES,
  });
}
