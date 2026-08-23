# AI Debate Arena

> Pick two personas, pick a topic, and watch them argue it out across five rounds.

**[Live demo](https://debate-mlx.vercel.app)**

Each round makes a separate call to Llama 3.3 with a system prompt that locks the model into one persona's rhetorical style and feeds it the last four exchanges, so arguments actually respond to what the opponent just said rather than restating an opening. Seven built-in personas ship with hand-written style instructions — Elon Musk argues from first principles, Socrates answers questions with questions, Shakespeare reaches for iambic pentameter — and you can type any custom name instead, which falls back to a generic in-character prompt. The final round is flagged so both sides deliver closing arguments.

## Features

- Seven scripted personas plus free-text custom personas on either side
- Five rounds, ten alternating arguments, rendered on a split-screen stage
- Eight quick-pick topics or your own
- Conversation context carried between turns so each side rebuts the last point
- Round announcements and a progress bar as the debate advances
- Audience vote at the end (either side or a tie) and a copyable full transcript

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Groq API — `llama-3.3-70b-versatile`, one request per argument, 30s max duration
- Deployed on Vercel

## Running locally

```bash
npm install
npm run dev
```

Requires `GROQ_API_KEY` in `.env.local`, read server-side by the `/api/debate` route.

---

Part of a series of 91 small web apps. [Browse them all](https://lorenzoylosada.vercel.app).
