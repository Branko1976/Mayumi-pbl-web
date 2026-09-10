"use client";

import { useState } from "react";

export default function PasswordGate({
  title,
  description,
  checkUrl,
  headerName,
  onVerified,
  savePassword,
  getPassword,
}: {
  title: string;
  description: string;
  checkUrl: string;
  headerName: "x-classroom-password" | "x-tutor-password";
  onVerified: () => void;
  savePassword: (pwd: string) => void;
  getPassword: () => string;
}) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      const res = await fetch(checkUrl, { headers: pwd ? { [headerName]: pwd } : {} });
      if (res.ok) {
        savePassword(pwd);
        onVerified();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Incorrect password.");
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-paper)" }}>
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl p-8 shadow-sm"
        style={{ background: "var(--color-paper-card)", border: "1px solid var(--color-line)" }}
      >
        <h1 className="text-xl mb-1" style={{ fontFamily: "Georgia, serif" }}>{title}</h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-grey-warm)" }}>{description}</p>
        <input
          type="password"
          autoFocus
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg px-3 py-2 mb-3 text-sm"
          style={{ border: "1px solid var(--color-line)", background: "var(--color-paper)" }}
        />
        {error && <p className="text-sm mb-3" style={{ color: "var(--color-clay-dark)" }}>{error}</p>}
        <button
          type="submit"
          disabled={checking}
          className="w-full rounded-lg py-2 text-sm font-medium text-white disabled:opacity-60"
          style={{ background: "var(--color-sage)" }}
        >
          {checking ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
