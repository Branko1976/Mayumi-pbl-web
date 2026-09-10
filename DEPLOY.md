# Mayumi PBL — Web Version (Deploy to Vercel)

A browser-based version of the Mayumi PBL clinical interview simulator.
Students open a URL and start immediately — no install, no app, no API key
setup on their end. Everything runs in the browser; Groq calls go through
a secure server-side API route so the shared key is never exposed.

## Deploy to Vercel in 5 minutes

### Step 1 — Put the code on GitHub

1. Create a free account at **github.com** if you don't have one.
2. Click **New repository** → name it `mayumi-pbl-web` → Create.
3. On your Mac, open Terminal and run:
   ```bash
   cd path/to/mayumi-web   # wherever you unzipped this folder
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/mayumi-pbl-web.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username.

### Step 2 — Deploy on Vercel

1. Go to **vercel.com** → sign in with your GitHub account.
2. Click **Add New → Project** → select your `mayumi-pbl-web` repository → click **Import**.
3. Vercel auto-detects Next.js. Don't change any build settings — just scroll
   down to **Environment Variables** and add these two:

   | Name | Value |
   |------|-------|
   | `GROQ_API_KEY` | Your Groq API key (from console.groq.com/keys) |
   | `CLASSROOM_PASSWORD` | A short password for your students (e.g. `nagoya2025`) |

4. Click **Deploy**. Vercel builds and deploys in about a minute.
5. Your app is live at a URL like `https://mayumi-pbl-web.vercel.app`.
   That's the link you share with students.

### Step 3 — Share with students

Send students the URL and the classroom password. They:
1. Open the link in any browser (Chrome, Safari, Firefox — any device)
2. Enter the classroom password
3. Enter their name and start the interview immediately

That's it — no install, no account, no API key.

---

## Updating the app

Any time you push a change to GitHub, Vercel automatically redeploys within
about 60 seconds. So to update the case content or anything else:

```bash
# make your changes, then:
git add .
git commit -m "describe what you changed"
git push
```

Vercel picks it up automatically.

---

## Changing the classroom password

In Vercel: **Project Settings → Environment Variables → edit CLASSROOM_PASSWORD → Save**.
Then redeploy (or push any change to trigger a redeploy). The new password
takes effect immediately on the next deploy.

---

## Running locally for testing

```bash
cp .env.example .env.local
# edit .env.local with your real GROQ_API_KEY
npm install
npm run dev
# Open http://localhost:3000
```

---

## Costs

- **Vercel free tier**: more than enough for a classroom. Vercel's free plan
  gives you 100GB bandwidth and unlimited serverless function calls per month.
- **Groq API**: billed per token. A full run-through of the case (all 6 steps)
  uses roughly 15,000–25,000 tokens depending on how much a student writes.
  At current Groq pricing this is a few US cents per student per session.
  Groq also has a generous free tier — check console.groq.com for current limits.

---

## Student data and privacy

- Session transcripts are stored in the student's own browser (`localStorage`).
  They persist between browser sessions on the same device, but are not stored
  on any server. Clearing browser data wipes the session.
- The content of each chat message is sent to Groq's API for processing. This
  is the same as using any LLM-powered tool. Review Groq's data policy at
  groq.com/privacy if needed for your institution.
- The classroom password protects the Groq quota but is not a security
  mechanism — the app is not designed for sensitive personal data.
