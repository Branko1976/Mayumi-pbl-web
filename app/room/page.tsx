"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RoomEntryPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) router.push(`/room/${trimmed}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-paper)" }}>
      <form
        onSubmit={go}
        className="w-full max-w-sm rounded-xl p-8 shadow-sm"
        style={{ background: "var(--color-paper-card)", border: "1px solid var(--color-line)" }}
      >
        <h1 className="text-xl mb-1" style={{ fontFamily: "Georgia, serif" }}>Join a classroom session</h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-grey-warm)" }}>Enter the session code your tutor gave you.</p>
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABCDE"
          className="w-full rounded-lg px-3 py-2 mb-4 text-center text-lg tracking-[0.3em] uppercase"
          style={{ border: "1px solid var(--color-line)", background: "var(--color-paper)" }}
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className="w-full rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "var(--color-sage)" }}
        >
          Continue
        </button>
      </form>
    </div>
  );
}
