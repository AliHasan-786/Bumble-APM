# Bumble Pulse — Pre-Send Vibe Check

A lightweight, LLM-powered message coaching tool that helps users write better opening messages on dating apps — before they hit send.

**Live demo:** [bumble-apm.vercel.app](https://bumble-apm.vercel.app)

---

## The Problem

First messages on dating apps have two failure modes:

1. **Low effort** — users default to "hey" or "what's up" because they don't know where to start. These get ignored.
2. **Low safety** — some users send aggressive, objectifying, or non-contextual messages that make the experience worse for everyone.

Most platforms handle both problems reactively: low-effort messages just fail silently, and unsafe messages get reported after the damage is done.

## The Idea

What if the platform intervened *before* the message was sent — not to rewrite it, but to coach the user?

Bumble Pulse is a pre-send evaluation layer. You draft a message, hit **Check Pulse**, and instantly get:

- **Safety Status** — pass or fail, with a clear reason if flagged
- **Tone Analysis** — how the message reads (Respectful / Forward / Objectifying / Inappropriate / Aggressive)
- **Pulse Score** — a 1–100 personalization score measuring how well the message references the recipient's actual profile, not just their appearance
- **Coach's Note** — a 1–2 sentence suggestion to improve before sending

The key constraint: the system never *writes* the message for you. Generative openers degrade the ecosystem into bots talking to bots. The goal is to nudge human behavior, not replace it.

---

## Why this matters (the metrics)

A real deployment of this pattern would target two things:

| Metric | Direction | Why |
|---|---|---|
| Day-1 message response rate | ↑ | Better openers get more replies, improving activation |
| Day-1 block/report rate for first messages | ↓ | Fewer aggressive openers means safer first impressions |

These are leading indicators for the deeper goal: more people experiencing what a good match actually feels like.

---

## How it works

The backend uses an **LLM-as-a-Judge** pattern: the model is not a conversationalist, it's an evaluator. It receives the recipient's profile context and the draft message, then returns a structured JSON object with four scored fields.

```json
{
  "is_safe": true,
  "tone": "Respectful",
  "pulse_score": 85,
  "coach_note": "Great job referencing Max and asking about hiking! Consider also asking about her favourite pizza spots.",
  "reasoning_trace": "Message references a specific named detail from the bio (the dog, Max) and asks a genuine follow-up question about a stated interest (hiking). No objectifying language detected."
}
```

The `reasoning_trace` is surfaced in a **Developer Logs** drawer (toggle top-right) — this is the part that matters architecturally. Quantifying subjective quality signals into a structured, auditable schema is the foundation for responsible AI deployment at scale: you can monitor drift, catch regressions, and A/B test prompt changes against a consistent baseline.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS v4 |
| AI | OpenRouter → `openai/gpt-4o-mini` |
| Deployment | Vercel |

---

## Running locally

```bash
git clone https://github.com/AliHasan-786/Bumble-APM.git
cd Bumble-APM
npm install
```

Create `.env.local`:

```
OPENROUTER_API_KEY=your_key_here
```

Free keys at [openrouter.ai](https://openrouter.ai).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/
├── page.tsx              # UI — profile selector, message input, scorecard
├── api/evaluate/
│   └── route.ts          # POST handler — evaluates message, returns structured JSON
lib/
├── profiles.ts           # Mock match profiles (Sarah, David, Elena)
└── types.ts              # EvaluationResult + Tone types
```

---

*Ali Hasan, 2026*
