"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  loadSession, saveSession, clearSession, createSession,
  addMessage, setAiScore, setTutorReview,
  apiChat, apiScore, apiExport,
  savePassword, getPassword,
} from "@/lib/client";
import type { SessionData, CaseStep, CaseMeta, Language, Message, AiScoreResult, TutorReview } from "@/lib/types";
import { CHARACTER_LABELS, CHARACTER_COLORS, STEPS_ORDER } from "@/lib/types";

// ── Shared tiny components ────────────────────────────────────────────────────

function Btn({ onClick, disabled, variant = "sage", children, className = "" }: {
  onClick?: () => void; disabled?: boolean;
  variant?: "sage" | "clay" | "ghost";
  children: React.ReactNode; className?: string;
}) {
  const base = "px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer";
  const styles = {
    sage: "bg-[var(--color-sage)] hover:bg-[var(--color-sage-dark)] text-white",
    clay: "bg-[var(--color-clay)] hover:bg-[var(--color-clay-dark)] text-white",
    ghost: "border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-grey-warm)] bg-transparent",
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>{children}</button>;
}

function CharBadge({ char, size = "md" }: { char: string; size?: "sm" | "md" }) {
  const color = CHARACTER_COLORS[char] || "#8A8478";
  const label = CHARACTER_LABELS[char] || char;
  const sz = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: color }} title={label}>
      {label.charAt(0).toUpperCase()}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isStudent = msg.sender === "student";
  if (isStudent) {
    return (
      <div className="flex justify-end msg-enter">
        <div className="max-w-[80%]">
          <p className="text-[11px] text-[var(--color-grey-warm)] text-right mb-1">
            You → {CHARACTER_LABELS[msg.addressedTo!] || msg.addressedTo}
          </p>
          <div className="bg-[var(--color-sage)] text-white rounded-lg rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed select-text">
            {msg.content}
          </div>
        </div>
      </div>
    );
  }
  const color = CHARACTER_COLORS[msg.sender] || "#8A8478";
  const isNarrator = msg.sender === "narrator";
  return (
    <div className="flex gap-2.5 msg-enter">
      <CharBadge char={msg.sender} />
      <div className="max-w-[80%]">
        <p className="text-[11px] font-semibold mb-1" style={{ color }}>{CHARACTER_LABELS[msg.sender] || msg.sender}</p>
        <div className={`rounded-lg rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed border-l-[3px] select-text ${isNarrator ? "italic text-[var(--color-ink-soft)]" : "bg-[var(--color-paper-card)] text-[var(--color-ink)]"}`}
          style={{ borderColor: color }}>
          {msg.content}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({ char }: { char: string }) {
  const color = CHARACTER_COLORS[char] || "#8A8478";
  return (
    <div className="flex gap-2.5">
      <CharBadge char={char} />
      <div>
        <p className="text-[11px] font-semibold mb-1" style={{ color }}>{CHARACTER_LABELS[char] || char}</p>
        <div className="rounded-lg rounded-tl-sm px-4 py-3 border-l-[3px] flex gap-1 items-center bg-[var(--color-paper-card)]" style={{ borderColor: color }}>
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--color-grey-warm)]" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--color-grey-warm)]" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--color-grey-warm)]" />
        </div>
      </div>
    </div>
  );
}

function ScoreBlock({ stepKey, stepLabel, ai, tutor, onSave }: {
  stepKey: string; stepLabel: string;
  ai: AiScoreResult | null; tutor: TutorReview | null;
  onSave: (score: number, feedback: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editScore, setEditScore] = useState(String(tutor?.score ?? ai?.score ?? ""));
  const [editFeedback, setEditFeedback] = useState(tutor?.feedback || ai?.feedback || "");
  if (!ai) return null;
  return (
    <div className="border border-[var(--color-line)] rounded-lg p-4 bg-[var(--color-paper-card)] msg-enter">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">{stepLabel} — AI Score</p>
        {tutor && <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--color-sage)] text-white font-semibold">Reviewed</span>}
      </div>
      <p className="text-2xl font-mono mb-2">
        {tutor?.score ?? ai.score ?? "—"}
        <span className="text-xs text-[var(--color-grey-warm)] ml-1">/ 100</span>
      </p>
      {ai.rubric?.length > 0 && (
        <ul className="space-y-1 mb-3">
          {ai.rubric.map((r, i) => (
            <li key={i} className="text-xs flex gap-2">
              <span style={{ color: r.met === true ? "var(--color-sage)" : r.met === "partial" ? "var(--color-clay)" : "var(--color-grey-warm)" }}>
                {r.met === true ? "✓" : r.met === "partial" ? "◐" : "✕"}
              </span>
              <span className="text-[var(--color-ink-soft)]">{r.criterion}</span>
            </li>
          ))}
        </ul>
      )}
      {(ai.strengths?.length > 0 || ai.areas_for_improvement?.length > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
          {ai.strengths?.length > 0 && (
            <div>
              <p className="font-semibold text-[var(--color-sage)] mb-1">Strengths</p>
              <ul>{ai.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul>
            </div>
          )}
          {ai.areas_for_improvement?.length > 0 && (
            <div>
              <p className="font-semibold text-[var(--color-clay)] mb-1">To improve</p>
              <ul>{ai.areas_for_improvement.map((s, i) => <li key={i}>• {s}</li>)}</ul>
            </div>
          )}
        </div>
      )}
      {!editing ? (
        <div>
          <p className="text-xs text-[var(--color-ink-soft)] leading-relaxed mb-2 select-text">{tutor?.feedback || ai.feedback}</p>
          <button onClick={() => setEditing(true)} className="text-xs text-[var(--color-sage)] underline underline-offset-2">
            {tutor ? "Edit notes" : "Add notes / override score"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input type="number" min={0} max={100} value={editScore} onChange={e => setEditScore(e.target.value)}
            className="w-20 px-2 py-1 text-sm rounded border border-[var(--color-line)] font-mono" />
          <textarea value={editFeedback} onChange={e => setEditFeedback(e.target.value)} rows={3}
            className="w-full px-2 py-1 text-sm rounded border border-[var(--color-line)] select-text" />
          <div className="flex gap-2">
            <button onClick={() => { onSave(parseFloat(editScore) || 0, editFeedback); setEditing(false); }}
              className="px-3 py-1 text-xs rounded bg-[var(--color-sage)] text-white">Save</button>
            <button onClick={() => setEditing(false)} className="px-3 py-1 text-xs rounded text-[var(--color-ink-soft)]">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Password Gate ─────────────────────────────────────────────────────────────

function PasswordGate({ onPass }: { onPass: () => void }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function submit() {
    if (!pwd.trim()) return;
    setChecking(true); setError("");
    savePassword(pwd);
    try {
      const res = await fetch("/api/meta", { headers: { "x-classroom-password": pwd } });
      if (res.ok) { onPass(); }
      else { setError("Incorrect classroom password. Ask your instructor."); }
    } catch { setError("Network error. Please try again."); }
    finally { setChecking(false); }
  }

  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-grey-warm)] mb-3 text-center">
          Problem-Based Learning · Psychiatry
        </p>
        <h1 className="text-3xl text-center mb-8" style={{ fontFamily: "Georgia, serif" }}>A Difficult Child</h1>
        <div className="p-6 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-[var(--color-ink-soft)] mb-1.5">Classroom password</span>
            <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="Enter your classroom password" autoFocus
              className="w-full px-3.5 py-2.5 rounded-md border border-[var(--color-line)] bg-white text-sm outline-none focus:border-[var(--color-sage)] select-text" />
          </label>
          {error && <p className="text-sm text-[var(--color-clay-dark)]">{error}</p>}
          <Btn onClick={submit} disabled={!pwd.trim() || checking}>
            {checking ? "Checking…" : "Enter classroom"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── Start Screen ──────────────────────────────────────────────────────────────

function StartScreen({ meta, existing, onStart, onResume }: {
  meta: CaseMeta; existing: SessionData | null;
  onStart: (name: string) => void; onResume: () => void;
}) {
  const [name, setName] = useState(existing?.displayName || "");
  const [confirmRestart, setConfirmRestart] = useState(false);

  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-grey-warm)] mb-3">
            Problem-Based Learning · Child &amp; Adolescent Psychiatry
          </p>
          <h1 className="text-5xl mb-3" style={{ fontFamily: "Georgia, serif" }}>{meta.title}</h1>
          <p className="text-[var(--color-ink-soft)] text-lg">{meta.subtitle}</p>
        </div>

        {existing && !confirmRestart && (
          <div className="mb-5 p-5 rounded-lg border border-[var(--color-sage)] bg-[var(--color-paper-card)]">
            <p className="text-sm font-semibold mb-1">Continue where you left off?</p>
            <p className="text-sm text-[var(--color-ink-soft)] mb-4">
              You have an interview in progress as <strong>{existing.displayName}</strong>.
            </p>
            <div className="flex gap-3">
              <Btn onClick={onResume}>Resume interview</Btn>
              <button onClick={() => setConfirmRestart(true)}
                className="text-sm text-[var(--color-clay-dark)] underline underline-offset-2">
                Start over
              </button>
            </div>
          </div>
        )}

        {(!existing || confirmRestart) && (
          <div className="p-6 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] space-y-4">
            {confirmRestart && (
              <p className="text-sm text-[var(--color-clay-dark)] bg-[#f7ece5] rounded px-3 py-2">
                Starting over will erase your current transcript. Export first if you want to keep it.
              </p>
            )}
            <label className="block">
              <span className="block text-sm font-medium text-[var(--color-ink-soft)] mb-1.5">Your name</span>
              <input value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && name.trim() && onStart(name.trim())}
                placeholder="e.g. K. Tanaka" autoFocus
                className="w-full px-3.5 py-2.5 rounded-md border border-[var(--color-line)] bg-white text-sm outline-none focus:border-[var(--color-sage)] select-text" />
            </label>
            <div className="flex gap-3">
              <Btn onClick={() => onStart(name.trim())} disabled={!name.trim()}>
                {confirmRestart ? "Start over" : "Begin the interview"}
              </Btn>
              {confirmRestart && (
                <button onClick={() => setConfirmRestart(false)}
                  className="text-sm text-[var(--color-ink-soft)]">Cancel</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Interview Screen ──────────────────────────────────────────────────────────

function InterviewScreen({ session, setSession, steps, languages, onRestart }: {
  session: SessionData; setSession: (s: SessionData) => void;
  steps: CaseStep[]; languages: Language[]; onRestart: () => void;
}) {
  const currentStep = steps.find(s => s.key === session.currentStepKey) || steps[0];
  const [addressee, setAddressee] = useState(currentStep.availableCharacters[0]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [goingBack, setGoingBack] = useState(false);
  const [typing, setTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [caseComplete, setCaseComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAddressee(currentStep.availableCharacters[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.currentStepKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [session.messages.length, typing]);

  const stepMsgs = session.messages.filter(m => m.stepKey === session.currentStepKey);
  const stepScore = session.scores[currentStep.key];

  async function send() {
    if (!draft.trim() || sending) return;
    const content = draft.trim();
    setDraft(""); setSending(true); setTyping(true); setErrorMsg(null);

    // Optimistically add student message
    const studentMsg = addMessage(session, {
      stepKey: currentStep.key, sender: "student", addressedTo: addressee, content,
    });
    setSession({ ...session });

    try {
      const history = session.messages
        .filter(m => m.stepKey === currentStep.key && m.id !== studentMsg.id)
        .filter(m => m.sender === "student" ? m.addressedTo === addressee : m.sender === addressee)
        .map(m => ({ role: (m.sender === "student" ? "user" : "assistant") as "user" | "assistant", content: m.content }));

      const reply = await apiChat(addressee, currentStep.key, session.language || "en", history, content);
      addMessage(session, { stepKey: currentStep.key, sender: addressee, addressedTo: null, content: reply });
      setSession({ ...session });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false); setTyping(false);
    }
  }

  async function nextStep() {
    if (advancing) return;
    setAdvancing(true); setErrorMsg(null);
    try {
      // Fire-and-forget scoring — doesn't block navigation
      const transcript = session.messages
        .filter(m => m.stepKey === currentStep.key)
        .map(m => ({ sender: m.sender, addressedTo: m.addressedTo, content: m.content }));
      apiScore(currentStep.key, transcript)
        .then(result => {
          setAiScore(session, currentStep.key, result);
          setSession({ ...session });
        })
        .catch(() => {});

      const nextIdx = STEPS_ORDER.indexOf(currentStep.key) + 1;
      if (nextIdx >= STEPS_ORDER.length) { setCaseComplete(true); return; }

      const nextKey = STEPS_ORDER[nextIdx];
      const nextStepData = steps.find(s => s.key === nextKey)!;
      session.currentStepKey = nextKey;

      const alreadyVisited = session.messages.some(m => m.stepKey === nextKey);
      if (!alreadyVisited) {
        addMessage(session, { stepKey: nextKey, sender: "narrator", addressedTo: null, content: nextStepData.settingNote });
      }
      saveSession(session);
      setSession({ ...session });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to advance.");
    } finally {
      setAdvancing(false);
    }
  }

  function prevStep() {
    if (goingBack || currentStep.order === 0) return;
    setGoingBack(true);
    const prevKey = STEPS_ORDER[STEPS_ORDER.indexOf(currentStep.key) - 1];
    session.currentStepKey = prevKey;
    saveSession(session);
    setSession({ ...session });
    setGoingBack(false);
  }

  function changeLanguage(code: string) {
    session.language = code;
    saveSession(session);
    setSession({ ...session });
  }

  async function handleExport() {
    setExporting(true); setExportNotice(null);
    try {
      await apiExport(session);
      setExportNotice("Downloaded ✓");
    } catch (err) {
      setExportNotice(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  // Case complete screen
  if (caseComplete) return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl mb-3" style={{ fontFamily: "Georgia, serif" }}>Case complete</h1>
        <p className="text-[var(--color-ink-soft)] mb-6">
          You&rsquo;ve worked through every step of Mayumi&rsquo;s case. Download your transcript and
          AI-suggested scores to submit to your tutor.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <Btn onClick={handleExport} variant="clay" disabled={exporting}>
            {exporting ? "Preparing…" : "Download transcript (.docx)"}
          </Btn>
          {exportNotice && <p className="text-sm text-[var(--color-ink-soft)]">{exportNotice}</p>}
          <button onClick={onRestart}
            className="text-sm text-[var(--color-grey-warm)] underline underline-offset-2 mt-2">
            Start a new interview
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-[var(--color-line)] overflow-hidden"
        style={{ background: "var(--color-paper)" }}>
        <div className="px-4 pt-5 pb-3 shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-grey-warm)] mb-1">PBL · Psychiatry</p>
          <h1 className="text-lg leading-snug" style={{ fontFamily: "Georgia, serif" }}>A Difficult Child</h1>
        </div>

        {/* Step rail */}
        <div className="flex-1 overflow-y-auto px-4 pb-3">
          <nav className="flex flex-col">
            {steps.map((step, i) => {
              const cur = step.order === currentStep.order;
              const past = step.order < currentStep.order;
              const last = i === steps.length - 1;
              return (
                <div key={step.key} className="flex gap-2.5">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ background: past || cur ? "var(--color-sage)" : "var(--color-line)" }} />
                    {!last && <div className="w-px flex-1 min-h-[24px]"
                      style={{ background: past ? "var(--color-sage)" : "var(--color-line)" }} />}
                  </div>
                  <p className={`text-xs pb-4 leading-snug ${cur ? "font-semibold text-[var(--color-ink)]" : past ? "text-[var(--color-ink-soft)]" : "text-[var(--color-grey-warm)]"}`}>
                    {step.label}
                    {cur && <span className="block text-[10px] text-[var(--color-sage)]">In progress</span>}
                  </p>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="px-4 py-3 shrink-0 border-t border-[var(--color-line)]">
          <button onClick={onRestart}
            className="text-xs text-[var(--color-clay-dark)] hover:underline underline-offset-2">
            Restart interview
          </button>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top header — fixed, never scrolls */}
        <header className="shrink-0 px-4 py-3 flex items-center justify-between gap-2 border-b border-[var(--color-line)]"
          style={{ background: "var(--color-paper)" }}>
          <p className="text-xs uppercase tracking-wide text-[var(--color-sage)] font-semibold truncate">
            {currentStep.label}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
            <Btn onClick={handleExport} variant="ghost" disabled={exporting} className="text-xs px-2.5 py-1.5">
              {exporting ? "…" : "Export (.docx)"}
            </Btn>
            <Btn onClick={prevStep} variant="ghost" disabled={goingBack || currentStep.order === 0} className="text-xs px-2.5 py-1.5">
              {goingBack ? "…" : "← Prev"}
            </Btn>
            <Btn onClick={nextStep} variant="clay" disabled={advancing} className="text-xs px-3 py-1.5">
              {advancing ? "Scoring…" : "Next step →"}
            </Btn>
          </div>
        </header>

        {exportNotice && (
          <div className="shrink-0 px-4 py-1.5 text-xs text-[var(--color-ink-soft)] bg-[var(--color-paper-card)] border-b border-[var(--color-line)]">
            {exportNotice}
          </div>
        )}

        {/* ── Messages — the ONLY scrolling region ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {stepMsgs.map(m => <MessageBubble key={m.id} msg={m} />)}
          {typing && <TypingIndicator char={addressee} />}
          {stepScore?.ai && (
            <ScoreBlock
              stepKey={currentStep.key}
              stepLabel={currentStep.label}
              ai={stepScore.ai}
              tutor={stepScore.tutor}
              onSave={(score, feedback) => {
                setTutorReview(session, currentStep.key, { score, feedback, reviewed: true });
                setSession({ ...session });
              }}
            />
          )}
        </div>

        {errorMsg && (
          <div className="shrink-0 px-4 py-2 text-sm text-[var(--color-clay-dark)] bg-[#f7ece5] border-t border-[var(--color-line)]">
            {errorMsg}
          </div>
        )}

        {/* Bottom input — fixed, never scrolls */}
        <div className="shrink-0 px-4 py-3 border-t border-[var(--color-line)] space-y-2"
          style={{ background: "var(--color-paper)" }}>

          {/* Character tabs + language */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              {currentStep.availableCharacters.map(c => (
                <button key={c} onClick={() => setAddressee(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    addressee === c
                      ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]"
                      : "border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-grey-warm)]"
                  }`}>
                  {CHARACTER_LABELS[c] || c}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1 text-xs text-[var(--color-grey-warm)]">
              <span>Language:</span>
              <select value={session.language || "en"} onChange={e => changeLanguage(e.target.value)}
                className="px-2 py-1 rounded border border-[var(--color-line)] bg-white text-xs text-[var(--color-ink-soft)] outline-none focus:border-[var(--color-sage)]">
                {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </label>
          </div>

          {/* Textarea + send */}
          <div className="flex gap-2">
            <textarea value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={`Speak to ${CHARACTER_LABELS[addressee] || addressee}…`}
              rows={2} disabled={sending}
              className="flex-1 resize-none px-3 py-2 rounded-md border border-[var(--color-line)] bg-white text-sm outline-none focus:border-[var(--color-sage)] disabled:opacity-60 select-text" />
            <Btn onClick={send} disabled={!draft.trim() || sending}>Send</Btn>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

type View = "loading" | "password" | "start" | "interview";

export default function Page() {
  const [view, setView] = useState<View>("loading");
  const [session, setSessionRaw] = useState<SessionData | null>(null);
  const [steps, setSteps] = useState<CaseStep[]>([]);
  const [meta, setMeta] = useState<CaseMeta | null>(null);
  const [languages, setLanguages] = useState<Language[]>([{ code: "en", label: "English" }]);

  const setSession = useCallback((s: SessionData) => {
    setSessionRaw(s); saveSession(s);
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/meta");
      if (res.status === 401) {
        // Password required — check if we already have one stored
        const pwd = getPassword();
        if (pwd) {
          const retry = await fetch("/api/meta", { headers: { "x-classroom-password": pwd } });
          if (retry.ok) {
            const d = await retry.json();
            setMeta(d.meta); setSteps(d.steps); setLanguages(d.languages || []);
            setSessionRaw(loadSession());
            setView("start"); return;
          }
        }
        setView("password");
      } else if (res.ok) {
        const d = await res.json();
        setMeta(d.meta); setSteps(d.steps); setLanguages(d.languages || []);
        setSessionRaw(loadSession());
        setView("start");
      }
    })();
  }, []);

  async function afterPassword() {
    const d = await fetch("/api/meta", { headers: { "x-classroom-password": getPassword() } }).then(r => r.json());
    setMeta(d.meta); setSteps(d.steps); setLanguages(d.languages || []);
    setSessionRaw(loadSession());
    setView("start");
  }

  function handleStart(name: string) {
    clearSession();
    const s = createSession(name);
    if (steps.length > 0) {
      addMessage(s, { stepKey: steps[0].key, sender: "narrator", addressedTo: null, content: steps[0].settingNote });
    }
    saveSession(s);
    setSessionRaw(s);
    setView("interview");
  }

  function handleRestart() { setView("start"); }

  if (view === "loading") return (
    <div className="h-full flex items-center justify-center">
      <p className="text-[var(--color-grey-warm)] text-sm">Loading…</p>
    </div>
  );
  if (view === "password") return <PasswordGate onPass={afterPassword} />;
  if (view === "start" && meta) return (
    <StartScreen meta={meta} existing={session}
      onStart={handleStart} onResume={() => setView("interview")} />
  );
  if (view === "interview" && session) return (
    <InterviewScreen session={session} setSession={setSession}
      steps={steps} languages={languages} onRestart={handleRestart} />
  );
  return null;
}
