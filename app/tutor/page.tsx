"use client";

import { useEffect, useState } from "react";
import PasswordGate from "@/components/PasswordGate";
import { saveTutorPassword, getTutorPassword } from "@/lib/client";
import {
  apiTutorCreateRoom,
  apiTutorGetState,
  apiTutorGetStudentChat,
  apiTutorSetScore,
  downloadTutorExport,
} from "@/lib/room-client";
import { CHARACTER_LABELS } from "@/lib/types";
import type { RoomStudentProgress, RoomChatMessage } from "@/lib/types";

const ONLINE_WINDOW_MS = 20_000; // considered "online" if seen in the last 20s (poll interval is ~3s)

export default function TutorPage() {
  const [gated, setGated] = useState(true);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [students, setStudents] = useState<RoomStudentProgress[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedStepKey, setSelectedStepKey] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<RoomChatMessage[]>([]);
  const [scoreDraft, setScoreDraft] = useState<{ score: string; feedback: string }>({ score: "", feedback: "" });
  const [savingScore, setSavingScore] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);

  // Restore an in-progress room from the URL on load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("room");
    if (r) setRoomCode(r.toUpperCase());
  }, []);

  // Poll the student list (name, step, scores, online status) — lightweight,
  // no chat content, so this is cheap even with many students.
  useEffect(() => {
    if (!roomCode || gated) return;
    let stopped = false;
    async function poll() {
      try {
        const { students: s } = await apiTutorGetState(roomCode!);
        if (!stopped) {
          setStudents(s);
          setPollError(null);
        }
      } catch (err) {
        if (!stopped) setPollError(err instanceof Error ? err.message : "Could not refresh.");
      }
    }
    poll();
    const id = setInterval(poll, 3000);
    return () => { stopped = true; clearInterval(id); };
  }, [roomCode, gated]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const room = await apiTutorCreateRoom(codeInput.trim() || undefined);
      openRoom(room.code);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create session.");
    } finally {
      setCreating(false);
    }
  }

  function openRoom(code: string) {
    const upper = code.toUpperCase();
    setRoomCode(upper);
    const url = new URL(window.location.href);
    url.searchParams.set("room", upper);
    window.history.replaceState({}, "", url.toString());
  }

  const selectedStudent = students.find((s) => s.id === selectedId) || null;
  useEffect(() => {
    if (selectedStudent && !selectedStepKey) setSelectedStepKey(selectedStudent.currentStepKey);
  }, [selectedStudent, selectedStepKey]);

  useEffect(() => {
    if (!selectedStudent || !selectedStepKey) return;
    const existing = selectedStudent.scores[selectedStepKey]?.tutor;
    setScoreDraft({ score: existing ? String(existing.score) : "", feedback: existing?.feedback || "" });
  }, [selectedStudent, selectedStepKey]);

  // Fetch (and live-poll) this one student's own transcript for the selected
  // step — the shared room chat, filtered down to just them, which is what
  // keeps the tutor's view "separated by student" even though students see
  // a merged feed of each other's questions.
  useEffect(() => {
    if (!roomCode || !selectedId || !selectedStepKey) {
      setTranscript([]);
      return;
    }
    let stopped = false;
    async function load() {
      try {
        const chat = await apiTutorGetStudentChat(roomCode!, selectedId!, selectedStepKey!);
        if (!stopped) setTranscript(chat);
      } catch {
        // ignore transient poll failures
      }
    }
    load();
    const id = setInterval(load, 4000);
    return () => { stopped = true; clearInterval(id); };
  }, [roomCode, selectedId, selectedStepKey]);

  async function handleSaveScore() {
    if (!roomCode || !selectedStudent || !selectedStepKey) return;
    const scoreNum = Number(scoreDraft.score);
    if (Number.isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      alert("Enter a score between 0 and 100.");
      return;
    }
    setSavingScore(true);
    try {
      await apiTutorSetScore(roomCode, selectedStudent.id, selectedStepKey, scoreNum, scoreDraft.feedback);
      const { students: s } = await apiTutorGetState(roomCode);
      setStudents(s);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not save score.");
    } finally {
      setSavingScore(false);
    }
  }

  if (gated) {
    return (
      <PasswordGate
        title="Tutor dashboard"
        description="Enter the tutor password to create or monitor a live classroom session."
        checkUrl="/api/room/tutor-check"
        headerName="x-tutor-password"
        savePassword={saveTutorPassword}
        getPassword={getTutorPassword}
        onVerified={() => setGated(false)}
      />
    );
  }

  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-paper)" }}>
        <form
          onSubmit={handleCreate}
          className="w-full max-w-sm rounded-xl p-8 shadow-sm"
          style={{ background: "var(--color-paper-card)", border: "1px solid var(--color-line)" }}
        >
          <h1 className="text-xl mb-1" style={{ fontFamily: "Georgia, serif" }}>Start or open a session</h1>
          <p className="text-sm mb-6" style={{ color: "var(--color-grey-warm)" }}>
            Leave blank for a random code, or type one to create/reopen a specific session. Students in the same
            session see each other&rsquo;s questions in a shared chat, as one group interviewing the case together —
            you still see and score each student separately here.
          </p>
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="ABCDE (optional)"
            className="w-full rounded-lg px-3 py-2 mb-4 text-center text-lg tracking-[0.3em] uppercase"
            style={{ border: "1px solid var(--color-line)", background: "var(--color-paper)" }}
          />
          {createError && <p className="text-sm mb-3" style={{ color: "var(--color-clay-dark)" }}>{createError}</p>}
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-lg py-2 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: "var(--color-sage)" }}
          >
            {creating ? "Starting…" : "Start session"}
          </button>
        </form>
      </div>
    );
  }

  const stepKeys = selectedStudent ? Object.keys(selectedStudent.scores).sort() : [];
  // Ensure the current step always appears as a tab even before it has any score yet.
  const visibleStepKeys = selectedStudent
    ? Array.from(new Set([...stepKeys, selectedStudent.currentStepKey]))
    : [];

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-paper)" }}>
      <aside className="w-72 flex-shrink-0 flex flex-col" style={{ borderRight: "1px solid var(--color-line)" }}>
        <div className="p-4" style={{ borderBottom: "1px solid var(--color-line)" }}>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--color-grey-warm)" }}>Live session</p>
          <p className="text-2xl tracking-[0.2em] font-medium" style={{ fontFamily: "Georgia, serif" }}>{roomCode}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-grey-warm)" }}>
            Share this link: <code className="break-all">{typeof window !== "undefined" ? `${window.location.origin}/room/${roomCode}` : ""}</code>
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {students.length === 0 && (
            <p className="text-sm p-4" style={{ color: "var(--color-grey-warm)" }}>No students have joined yet.</p>
          )}
          {students.map((s) => {
            const online = Date.now() - new Date(s.lastSeenAt).getTime() < ONLINE_WINDOW_MS;
            return (
              <button
                key={s.id}
                onClick={() => { setSelectedId(s.id); setSelectedStepKey(null); }}
                className="w-full text-left px-4 py-3 text-sm flex items-center gap-2"
                style={{
                  background: selectedId === s.id ? "var(--color-paper-card)" : "transparent",
                  borderBottom: "1px solid var(--color-line)",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: online ? "var(--color-sage)" : "var(--color-line)" }}
                  title={online ? "Online" : "Idle / offline"}
                />
                <span className="flex-1 truncate">{s.displayName}</span>
                <span className="text-xs" style={{ color: "var(--color-grey-warm)" }}>
                  step {Object.keys(s.scores).length + 1}
                </span>
              </button>
            );
          })}
        </div>
        {pollError && <p className="text-xs p-3" style={{ color: "var(--color-clay-dark)" }}>{pollError}</p>}
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {!selectedStudent ? (
          <p className="text-sm" style={{ color: "var(--color-grey-warm)" }}>Select a student on the left to review their transcript and scores.</p>
        ) : (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl" style={{ fontFamily: "Georgia, serif" }}>{selectedStudent.displayName}</h1>
              <button
                onClick={() => downloadTutorExport(roomCode, selectedStudent.id, `${selectedStudent.displayName}.docx`)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ border: "1px solid var(--color-line)" }}
              >
                Export .docx
              </button>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              {visibleStepKeys.map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedStepKey(k)}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{
                    background: selectedStepKey === k ? "var(--color-sage)" : "var(--color-paper-card)",
                    color: selectedStepKey === k ? "white" : "var(--color-ink)",
                    border: "1px solid var(--color-line)",
                  }}
                >
                  {k}
                </button>
              ))}
            </div>

            {selectedStepKey && (
              <>
                <div className="rounded-xl p-4 mb-4" style={{ background: "var(--color-paper-card)", border: "1px solid var(--color-line)" }}>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--color-grey-warm)" }}>
                    Transcript — {selectedStudent.displayName} only
                  </p>
                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                    {transcript.map((m) => (
                      <div key={m.id} className="text-sm">
                        <span className="font-medium">{m.sender === "student" ? selectedStudent.displayName : CHARACTER_LABELS[m.sender] || m.sender}: </span>
                        <span>{m.content}</span>
                      </div>
                    ))}
                    {transcript.length === 0 && (
                      <p className="text-sm" style={{ color: "var(--color-grey-warm)" }}>No messages from this student for this step yet.</p>
                    )}
                  </div>
                </div>

                {selectedStudent.scores[selectedStepKey]?.ai && (
                  <div className="rounded-xl p-4 mb-4" style={{ background: "var(--color-paper-card)", border: "1px solid var(--color-line)" }}>
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--color-grey-warm)" }}>AI-suggested score</p>
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--color-sage-dark)" }}>
                      {selectedStudent.scores[selectedStepKey]!.ai!.score ?? "—"} / 100
                    </p>
                    <p className="text-sm mb-2">{selectedStudent.scores[selectedStepKey]!.ai!.feedback}</p>
                    <ul className="text-sm space-y-1">
                      {selectedStudent.scores[selectedStepKey]!.ai!.rubric.map((r, i) => (
                        <li key={i}>
                          <span style={{ color: r.met === true ? "var(--color-sage-dark)" : r.met === "partial" ? "var(--color-clay-dark)" : "var(--color-grey-warm)" }}>
                            {r.met === true ? "✓" : r.met === "partial" ? "±" : "○"}
                          </span>{" "}
                          {r.criterion} — <span style={{ color: "var(--color-grey-warm)" }}>{r.note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-xl p-4" style={{ background: "var(--color-paper-card)", border: "1px solid var(--color-line)" }}>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--color-grey-warm)" }}>Tutor final score</p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={scoreDraft.score}
                      onChange={(e) => setScoreDraft((d) => ({ ...d, score: e.target.value }))}
                      placeholder="0-100"
                      className="w-24 rounded-lg px-3 py-2 text-sm"
                      style={{ border: "1px solid var(--color-line)", background: "var(--color-paper)" }}
                    />
                    <button
                      onClick={handleSaveScore}
                      disabled={savingScore}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
                      style={{ background: "var(--color-clay)" }}
                    >
                      {savingScore ? "Saving…" : "Save"}
                    </button>
                  </div>
                  <textarea
                    value={scoreDraft.feedback}
                    onChange={(e) => setScoreDraft((d) => ({ ...d, feedback: e.target.value }))}
                    placeholder="Comments for the student (optional)…"
                    rows={3}
                    className="w-full rounded-lg px-3 py-2 text-sm"
                    style={{ border: "1px solid var(--color-line)", background: "var(--color-paper)" }}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
