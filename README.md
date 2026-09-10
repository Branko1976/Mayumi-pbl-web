# Meth Psychosis PBL — Web App

A browser-based PBL clinical-interview simulator for the case "Acute
Agitation in a Postpartum Woman" (methamphetamine-induced psychosis).
Students interview a simulated patient, her friend, and her mother through
an LLM chat, progressing step by step; each step ends with an AI-suggested
score against the tutor's rubric.

Built with Next.js (App Router). **The Groq API key lives only in a
server-side environment variable (`GROQ_API_KEY`)** — read inside the API
routes under `app/api/`, never sent to or visible in the browser.

**→ See [`DEPLOY.md`](./DEPLOY.md) for the full step-by-step guide** to
getting this live at a real URL via GitHub + Vercel, plus local development
instructions, cost notes, and privacy notes.

## Two modes

- **Solo mode** (`/`) — a student works through the case independently and
  downloads a `.docx` report at the end. Session lives only in their own
  browser (`localStorage`). Needs only `GROQ_API_KEY` (and optionally
  `CLASSROOM_PASSWORD`).
- **Live classroom mode** (`/tutor` + `/room/[code]`) — the tutor starts a
  session and shares a link; every student who joins appears on the tutor's
  dashboard in real time (polling, ~3s), with live transcripts, AI-suggested
  scores, and a place for the tutor to enter the final score/comments, which
  the student then sees on their own screen too. Needs a Redis database
  (Upstash, via Vercel's Storage tab) and a separate `TUTOR_PASSWORD` — see
  `DEPLOY.md` for setup.

Both modes share the same case content, chat/scoring logic, and export
format — the only difference is where session state lives (the student's
browser vs. a shared Redis store) and who else can see it.

## Project layout

```
app/
  page.tsx              Solo-mode UI (start screen, password gate,
                         interview, step rail, score cards).
  layout.tsx             Page shell + metadata.
  room/
    page.tsx              Entry page for students with a code but no link.
    [code]/page.tsx         Live classroom student interview — same case
                           experience as solo mode, but every action
                           round-trips through /api/room/... so the tutor
                           dashboard can watch in real time.
  tutor/page.tsx          Tutor dashboard: separate password gate, create/
                         open a session, live student list, transcript +
                         score review, score override, .docx export.
  api/
    meta/route.ts          Case metadata + steps + languages (password-gated).
    chat/route.ts            Solo-mode chat via Groq (password-gated).
    score/route.ts            Solo-mode AI scoring via Groq (password-gated).
    export/route.ts          Solo-mode .docx export.
    room/
      create/route.ts          Tutor creates a session (tutor-gated).
      join/route.ts             Student joins/creates a room by code.
      tutor-check/route.ts        Lightweight tutor-password verification.
      [code]/
        chat/route.ts             Classroom-mode chat (server-authoritative).
        score/route.ts             Classroom-mode AI scoring.
        step/route.ts               Advance/return a student's step.
        session/route.ts             Student re-fetches their own state.
        state/route.ts               Tutor-only: full room dump for the dashboard.
        tutor-score/route.ts          Tutor-only: set/override a final score.
        export/route.ts               Tutor-only: a given student's .docx.
lib/
  auth.ts                Shared classroom-password check + separate
                         tutor-password check, used by every API route.
  llm.ts                  Groq client + prompt builders (roleplay + scoring),
                         shared by both solo and classroom modes.
  docxExport.ts            Shared .docx report builder, used by both the
                         solo and classroom export routes.
  client.ts                Solo-mode browser data layer (localStorage + API calls).
  room-client.ts            Classroom-mode browser data layer (room API calls,
                         tutor-password storage, local resume cache).
  room-store.ts             Redis storage layer for classroom mode: rooms,
                         students, TTL-based auto-expiry.
  types.ts                  Shared TypeScript types and character label/color maps.
components/
  PasswordGate.tsx          Shared password-entry component used by the
                         classroom and tutor pages.
data/
  case.js                   All case content: steps, revealed facts per
                         step, character personas, and the scoring rubric
                         per step. Edit this file to change the case —
                         nothing else needs to change, in either mode.
  languages.js               Languages students can converse with characters in.
```

## Quick local start (solo mode only)

```bash
cp .env.example .env.local
# edit .env.local with your real GROQ_API_KEY (and optionally CLASSROOM_PASSWORD)
npm install
npm run dev
# open http://localhost:3000
```

For live classroom mode locally, you'll also need a Redis database — see
`DEPLOY.md`'s "Running locally for testing" section.
