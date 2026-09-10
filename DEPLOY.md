# Meth Psychosis PBL — Web Version (Deploy to Vercel)

A browser-based version of the "Acute Agitation in a Postpartum Woman" PBL
clinical interview simulator. This app has **two modes**, both live at the
same deployment:

- **Solo mode** (`/`) — a student opens the link, works through the case on
  their own, and downloads a `.docx` report at the end to hand to their
  tutor. No shared state between students.
- **Live classroom mode** (`/tutor` + `/room/...`) — the tutor starts a
  session and gets a code/link to share; every student who joins shows up
  on the tutor's dashboard **in real time** — live transcripts, AI-suggested
  scores, and the tutor can enter a final score/comments right there, which
  the student sees appear on their own screen too. Students working on the
  same step **see each other's questions and the characters' replies** in
  one shared chat, like a group interview — but each student's own
  AI-suggested score, tutor score, and exported report only ever reflect
  *their own* questions, never a classmate's.

In both modes, **Groq calls go through a secure server-side API route**, so
your Groq key is a server environment variable and is never sent to, or
visible in, a student's browser.

## Deploy to Vercel in about 10 minutes

### Step 1 — Put the code on GitHub

1. Create a free account at **github.com** if you don't have one.
2. Click **New repository** → name it `meth-psychosis-pbl-web` → Create.
3. On your Mac, open Terminal and run:
   ```bash
   cd path/to/meth-psychosis-pbl-web   # wherever you unzipped this folder
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/meth-psychosis-pbl-web.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username.

   > If `git add .`/`git commit` says "nothing added to commit" or complains
   > about "dubious ownership," don't run any of this with `sudo`/`su` —
   > just run it as your normal Mac user account in a normal Terminal window.

### Step 2 — Import the project on Vercel

1. Go to **vercel.com** → sign in with your GitHub account.
2. Click **Add New → Project** → select your `meth-psychosis-pbl-web`
   repository → click **Import**.
3. Vercel auto-detects Next.js — don't change any build settings yet. Before
   clicking Deploy, add the environment variables below (Step 3), or add
   them right after your first deploy under **Project Settings →
   Environment Variables** and redeploy.

### Step 3 — Environment variables

| Name | Required for | Value |
|------|--------------|-------|
| `GROQ_API_KEY` | Both modes | Your key from console.groq.com/keys |
| `CLASSROOM_PASSWORD` | Both modes (optional) | A password students enter (e.g. `nagoya2025`). Leave unset for an open link. |
| `TUTOR_PASSWORD` | Live classroom mode only | A **separate** password only you know — protects `/tutor` and every student's data from being visible to students. **Required** for `/tutor` to work at all. |

All three are **server-side only** — read inside `app/api/` route handlers,
never sent to the browser.

### Step 4 — Add a Redis database (live classroom mode only)

Skip this if you only plan to use solo mode — solo mode needs nothing
beyond Step 3. Live classroom mode needs somewhere to hold shared "who's
online, what have they said, what's their score" state that both students
and the tutor read from, since serverless functions don't keep memory
between requests.

1. In your Vercel project, go to the **Storage** tab.
2. Click **Create Database** (or **Browse Marketplace**) → find **Upstash**
   → choose **Redis** (sometimes listed as "Upstash for Redis" or "Upstash
   KV") → follow the prompts to create a free-tier database and connect it
   to this project.
3. Vercel automatically injects the connection details as environment
   variables — you don't need to copy/paste anything. (They usually show up
   as `KV_REST_API_URL` / `KV_REST_API_TOKEN`, or sometimes
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — this app reads
   either naming, so whichever your integration used just works.)
4. Redeploy (Vercel usually does this automatically after connecting a new
   integration; if not, go to **Deployments** → the three-dot menu on the
   latest deployment → **Redeploy**).

Free-tier Upstash Redis is more than enough for classroom scale — a single
session for 30 students uses a trivial amount of the free quota. Room and
student data auto-expire after 3 days of inactivity, so nothing piles up.

### Step 5 — You're live

- **Solo mode:** share `https://your-app.vercel.app/` — students enter the
  classroom password (if you set one) and work independently.
- **Live classroom mode:** go to `https://your-app.vercel.app/tutor`
  yourself, enter your tutor password, click **Start session** (leave the
  code blank for a random one, or type a memorable one like `NAGOYA1`).
  Share the link shown at the top of the dashboard
  (`.../room/<CODE>`) with students — they click it, type their name, and
  start immediately. Everyone working on the same step sees the same chat —
  their own questions and their classmates' — as one shared group interview
  of the case. Their progress, transcripts, and AI-suggested scores
  appear on your dashboard within a few seconds, live, and always broken
  out by student even though their chat is shared. Click a student to
  review their step-by-step transcript, enter your own final score and
  comments (overriding or confirming the AI's suggestion), and export their
  `.docx` report whenever you like — no need to wait until they're done.

---

## Updating the app

Any time you push a change to GitHub, Vercel automatically redeploys within
about 60 seconds:

```bash
git add .
git commit -m "describe what you changed"
git push
```

## Changing a password or the Groq key

**Project Settings → Environment Variables → edit the value → Save**, then
redeploy (or push any change to trigger one). Leaving `CLASSROOM_PASSWORD`
or `TUTOR_PASSWORD` unset makes that part of the app open to anyone with the
link — `TUTOR_PASSWORD` is the one exception: with no value set, `/tutor`
refuses to load rather than opening access, since it protects every
student's data.

## Running locally for testing

```bash
cp .env.example .env.local
# edit .env.local with your real GROQ_API_KEY, and (for live classroom mode)
# a Redis database's REST URL/token — see Step 4 above, or run a local Redis
# and point KV_REST_API_URL at http://localhost:<port> via a REST-compatible
# proxy if you want to test that mode without a cloud database.
npm install
npm run dev
# Open http://localhost:3000 (solo mode) or http://localhost:3000/tutor (classroom mode)
```

---

## Costs

- **Vercel free tier**: more than enough for a classroom.
- **Upstash Redis free tier**: more than enough for classroom-scale live
  sessions (the free tier's request quota is generally in the hundreds of
  thousands per month; a full class session uses a tiny fraction of that).
- **Groq API**: billed per token. A full run-through of the case (all 7
  steps) uses roughly 15,000–25,000 tokens per student. At current Groq
  pricing this is a few US cents per student per session. Groq also has a
  free tier — check console.groq.com for current limits.

## Student data and privacy

- **Solo mode:** transcripts live only in the student's own browser
  (`localStorage`). Nothing is stored on any server beyond the moment a
  chat/scoring request is processed.
- **Live classroom mode:** transcripts and scores live in your Redis
  database for the duration of the session (auto-expiring after 3 days of
  inactivity), so the tutor dashboard can read them. This is the tradeoff
  that makes the "live" dashboard possible.
- In both modes, the content of each chat message is sent to Groq's API for
  processing, from Vercel's server. Review Groq's data policy at
  groq.com/privacy if needed for your institution.
- Passwords protect your Groq quota and the tutor dashboard but aren't a
  strong security mechanism — this isn't designed for sensitive personal
  data.

## Case content

Everything about the case — narrative per step, which characters unlock
when, what each character is allowed to reveal, and the AI-scoring rubric —
lives in `data/case.js`. Edit that file to adjust wording, add a step, or
change the rubric; the chat prompts and scoring prompts in `lib/llm.ts` are
both built from it automatically, for both solo and classroom modes. Push
your change and Vercel redeploys it.
