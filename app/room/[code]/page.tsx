"use client";

import { useEffect, useRef, useState, use as usePromise } from "react";
import PasswordGate from "@/components/PasswordGate";
import { getPassword, savePassword } from "@/lib/client";
import {
  apiJoinRoom,
  apiGetRoomSession,
  apiGetStepChat,
  apiRoomChat,
  apiRoomScore,
  apiRoomStep,
  saveLocalRoomIdentity,
  loadLocalRoomIdentity,
} from "@/lib/room-client";
import { CHARACTER_LABELS, CHARACTER_COLORS } from "@/lib/types";
import type { RoomStudentProgress, RoomChatMessage, CaseStep, CaseMeta, Language } from "@/lib/types";

type Stage = "checking" | "gate" | "join" | "interview" | "complete";

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = usePromise(params);
  const code = rawCode.toUpperCase();

  const [stage, setStage] = useState<Stage>("checking");
  const [meta, setMeta] = useState<CaseMeta | null>(null);
  const [steps, setSteps] = useState<CaseStep[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [progress, setProgress] = useState<RoomStudentProgress | null>(null);
  const [studentId, setStudentId] = useState<string>("");
  const [nameInput, setNameInput] = useState("");
  const [languageInput, setLanguageInput] = useState("en");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [activeChar, setActiveChar] = useState<string>("");
  const [stepChat, setStepChat] = useState<RoomChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [scoring, setScoring] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Silent password check, then load case meta.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/meta", { headers: getPassword() ? { "x-classroom-password": getPassword() } : {} });
        if (!res.ok) {
          setStage("gate");
          return;
        }
        const data = await res.json();
        setMeta(data.meta);
        setSteps(data.steps);
        setLanguages(data.languages);

        const saved = loadLocalRoomIdentity(code);
        if (saved) {
          try {
            const p = await apiGetRoomSession(code, saved.studentId);
            setStudentId(saved.studentId);
            setProgress(p);
            setStage("interview");
            return;
          } catch {
            // stale local identity (server restarted / expired) — fall through to join form
          }
        }
        setStage("join");
      } catch {
        setStage("gate");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Load the shared step chat whenever the current step changes, and pick a
  // default active character for it.
  useEffect(() => {
    if (!progress) return;
    const step = steps.find((s) => s.key === progress.currentStepKey);
    if (!step) return;
    if (!step.availableCharacters.includes(activeChar as never)) {
      setActiveChar(step.availableCharacters[0] || "");
    }
    apiGetStepChat(code, progress.currentStepKey).then(setStepChat).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress?.currentStepKey, steps]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [stepChat.length]);

  // Live polling while in an interview: the shared step chat (so a
  // classmate's new question/reply shows up without refreshing) and the
  // student's own progress (so a tutor's score override shows up too).
  useEffect(() => {
    if (stage !== "interview" || !studentId || !progress) return;
    const stepKey = progress.currentStepKey;
    const id = setInterval(async () => {
      try {
        const [chat, p] = await Promise.all([apiGetStepChat(code, stepKey), apiGetRoomSession(code, studentId)]);
        setStepChat(chat);
        // Only adopt the polled progress if we're still on the same step —
        // avoids clobbering an in-flight step change from this tab itself.
        setProgress((prev) => (prev && prev.currentStepKey === stepKey ? p : prev));
      } catch {
        // ignore transient poll failures
      }
    }, 3000);
    return () => clearInterval(id);
  }, [stage, studentId, progress?.currentStepKey, code]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setJoinError(null);
    try {
      const { session: p } = await apiJoinRoom(code, nameInput.trim(), languageInput);
      saveLocalRoomIdentity(code, p.id, p.displayName);
      setStudentId(p.id);
      setProgress(p);
      setStage("interview");
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Could not join.");
    }
  }

  async function handleSend() {
    if (!chatInput.trim() || !progress || !activeChar || sending) return;
    const text = chatInput.trim();
    setChatInput("");
    setSending(true);
    try {
      const { chat, session: p } = await apiRoomChat(code, studentId, activeChar, text);
      setStepChat(chat);
      setProgress(p);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Message failed.");
    } finally {
      setSending(false);
    }
  }

  async function handleNextStep() {
    if (!progress) return;
    setScoring(true);
    try {
      await apiRoomScore(code, studentId);
      const { session: p, atEnd } = await apiRoomStep(code, studentId, "next");
      setProgress(p);
      if (atEnd) setStage("complete");
      else setStepChat(await apiGetStepChat(code, p.currentStepKey));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not move to the next step.");
    } finally {
      setScoring(false);
    }
  }

  async function handlePrevStep() {
    if (!progress) return;
    try {
      const { session: p } = await apiRoomStep(code, studentId, "previous");
      setProgress(p);
      setStepChat(await apiGetStepChat(code, p.currentStepKey));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not go back.");
    }
  }

  if (stage === "checking") {
    return <div className="min-h-screen flex items-center justify-center" style={{ color: "var(--color-grey-warm)" }}>Loading…</div>;
  }

  if (stage === "gate") {
    return (
      <PasswordGate
        title="Classroom session"
        description={`Enter the classroom password to join session ${code}.`}
        checkUrl="/api/meta"
        headerName="x-classroom-password"
        savePassword={savePassword}
        getPassword={getPassword}
        onVerified={() => setStage("join")}
      />
    );
  }

  if (stage === "join") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-paper)" }}>
        <form
          onSubmit={handleJoin}
          className="w-full max-w-sm rounded-xl p-8 shadow-sm"
          style={{ background: "var(--color-paper-card)", border: "1px solid var(--color-line)" }}
        >
          <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: "var(--color-grey-warm)" }}>
            Classroom session {code}
          </p>
          <h1 className="text-2xl mb-1" style={{ fontFamily: "Georgia, serif" }}>{meta?.title || "Mayumi PBL"}</h1>
          <p className="text-sm mb-6" style={{ color: "var(--color-grey-warm)" }}>{meta?.subtitle}</p>

          <label className="block text-xs mb-1" style={{ color: "var(--color-grey-warm)" }}>Your name</label>
          <input
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Taro Yamada"
            className="w-full rounded-lg px-3 py-2 mb-4 text-sm"
            style={{ border: "1px solid var(--color-line)", background: "var(--color-paper)" }}
          />

          <label className="block text-xs mb-1" style={{ color: "var(--color-grey-warm)" }}>Reply language</label>
          <select
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            className="w-full rounded-lg px-3 py-2 mb-4 text-sm"
            style={{ border: "1px solid var(--color-line)", background: "var(--color-paper)" }}
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          <p className="text-xs mb-4" style={{ color: "var(--color-grey-warm)" }}>
            Heads up: other students in this session can see the questions you ask and the replies you get — you&rsquo;re
            all interviewing the same case together.
          </p>

          {joinError && <p className="text-sm mb-3" style={{ color: "var(--color-clay-dark)" }}>{joinError}</p>}

          <button
            type="submit"
            className="w-full rounded-lg py-2 text-sm font-medium text-white"
            style={{ background: "var(--color-sage)" }}
          >
            Join session
          </button>
        </form>
      </div>
    );
  }

  if (stage === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center" style={{ background: "var(--color-paper)" }}>
        <div className="max-w-md">
          <h1 className="text-2xl mb-3" style={{ fontFamily: "Georgia, serif" }}>Case complete</h1>
          <p className="text-sm" style={{ color: "var(--color-grey-warm)" }}>
            You&rsquo;ve worked through every step of the case. Your tutor can see your full transcript and
            AI-suggested scores on the live dashboard, and will confirm your final scores there.
          </p>
        </div>
      </div>
    );
  }

  // stage === "interview"
  const step = steps.find((s) => s.key === progress?.currentStepKey);
  const stepIndex = steps.findIndex((s) => s.key === progress?.currentStepKey);
  const threadMessages = stepChat.filter((m) => m.characterKey === activeChar);
  const stepScore = progress ? progress.scores[progress.currentStepKey] : undefined;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-paper)" }}>
      <header className="px-6 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-line)" }}>
        <div>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--color-grey-warm)" }}>
            Classroom {code} · Step {stepIndex + 1} of {steps.length} · shared chat
          </p>
          <h1 className="text-base" style={{ fontFamily: "Georgia, serif" }}>{step?.label}</h1>
        </div>
        <p className="text-sm" style={{ color: "var(--color-grey-warm)" }}>{progress?.displayName}</p>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col p-6 gap-4 overflow-y-auto max-w-3xl mx-auto w-full">
          <div className="rounded-xl p-4" style={{ background: "var(--color-paper-card)", border: "1px solid var(--color-line)" }}>
            <p className="text-sm leading-relaxed">{step?.settingNote}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {step?.availableCharacters.map((c) => (
              <button
                key={c}
                onClick={() => setActiveChar(c)}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: activeChar === c ? CHARACTER_COLORS[c] : "var(--color-paper-card)",
                  color: activeChar === c ? "white" : "var(--color-ink)",
                  border: `1px solid ${activeChar === c ? CHARACTER_COLORS[c] : "var(--color-line)"}`,
                }}
              >
                {CHARACTER_LABELS[c] || c}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
            {threadMessages.map((m) => {
              const isMe = m.sender === "student" && m.studentId === studentId;
              const isOtherStudent = m.sender === "student" && m.studentId !== studentId;
              return (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? "self-end text-white" : "self-start"}`}
                  style={{
                    background: isMe ? "var(--color-sage)" : "var(--color-paper-card)",
                    border: isMe ? "none" : "1px solid var(--color-line)",
                  }}
                >
                  {isOtherStudent && (
                    <p className="text-[10px] font-medium mb-0.5" style={{ color: "var(--color-clay-dark)" }}>{m.studentName}</p>
                  )}
                  {m.sender !== "student" && (
                    <p className="text-[10px] font-medium mb-0.5" style={{ color: "var(--color-grey-warm)" }}>
                      {CHARACTER_LABELS[m.sender] || m.sender} → {m.studentName}
                    </p>
                  )}
                  {m.content}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={activeChar ? `Message ${CHARACTER_LABELS[activeChar] || activeChar}…` : "Select who to talk to"}
              disabled={sending}
              className="flex-1 rounded-lg px-3 py-2 text-sm"
              style={{ border: "1px solid var(--color-line)", background: "var(--color-paper-card)" }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !chatInput.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "var(--color-sage)" }}
            >
              {sending ? "…" : "Send"}
            </button>
          </div>

          {stepScore?.ai && (
            <div className="rounded-xl p-4 text-sm" style={{ background: "var(--color-paper-card)", border: "1px solid var(--color-line)" }}>
              <p className="font-medium mb-1" style={{ color: "var(--color-sage-dark)" }}>
                AI-suggested score: {stepScore.ai.score ?? "—"} / 100
              </p>
              <p style={{ color: "var(--color-ink-soft)" }}>{stepScore.ai.feedback}</p>
              {stepScore.tutor?.reviewed && (
                <p className="mt-2 font-medium" style={{ color: "var(--color-clay-dark)" }}>
                  Tutor score: {stepScore.tutor.score} / 100 {stepScore.tutor.feedback ? `— ${stepScore.tutor.feedback}` : ""}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              onClick={handlePrevStep}
              disabled={stepIndex <= 0}
              className="px-4 py-2 rounded-lg text-sm disabled:opacity-40"
              style={{ border: "1px solid var(--color-line)" }}
            >
              ← Back
            </button>
            <button
              onClick={handleNextStep}
              disabled={scoring}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
              style={{ background: "var(--color-clay)" }}
            >
              {scoring ? "Scoring…" : stepIndex >= steps.length - 1 ? "Finish case" : "Next step →"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
