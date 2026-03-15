# Bumble Pulse — Interactive Pre-Send Vibe Check

A portfolio project built for the **Associate Product Manager, Bumble Date (2026)** application.

**Live demo:** [bumble-apm.vercel.app](https://bumble-apm.vercel.app)

---

## What is this?

Bumble Pulse is an LLM-powered pre-send guardrail that coaches users before they send their first message. It addresses two core problems in dating apps:

1. **Activation friction** — users face blank-canvas syndrome and default to low-effort openers ("hey") that get ignored
2. **Safety & respect** — even with filters, users still receive objectifying or aggressive first messages

Before sending, a user can **Check Pulse**. The system acts as an AI judge, evaluating their draft against the recipient's specific profile context and returning an instant scorecard with three signals:

| Signal | What it measures |
|---|---|
| **Safety Status** | Binary pass/fail — flags harassment, objectification, sexual content, aggression |
| **Tone Analysis** | Qualitative classification: Respectful / Forward / Objectifying / Inappropriate / Aggressive |
| **Pulse Score** | 1–100 personalization score — how well the message references the recipient's actual profile |

A **Coach's Note** then gives a 1–2 sentence suggestion to improve the message before it reaches anyone's inbox.

---

## Product Thesis

> Deploying generative AI to *write* messages for users degrades the dating ecosystem into bots talking to bots. Bumble Pulse shifts Trust & Safety from **reactive moderation** to **proactive, empathetic coaching** — augmenting human authenticity rather than replacing it.

**Primary metric:** Increase Day-1 message response rate
**Secondary metric:** Decrease Day-1 block/report rate for initial messages

---

## Features

- **3 mock match profiles** (Sarah, David, Elena) with distinct bios and interest tags
- **LLM-as-a-Judge** evaluation engine with structured JSON output schema
- **Developer Logs toggle** — slide-up terminal drawer exposing raw LLM response and reasoning trace, demonstrating the system architecture to technical interviewers
- **Adaptive Send button** — disabled on safety failures; only unlocked when a message passes the safety gate
- **Confetti** on high-scoring personalized messages (score ≥ 76, safe)
- **Profile-specific test cases** in the hint box for each match

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS v4, Bumble brand colors (`#FFC629`) |
| AI | OpenRouter → `openai/gpt-4o-mini` via OpenAI-compatible SDK |
| Deployment | Vercel |

---

## Running locally

```bash
git clone https://github.com/AliHasan-786/Bumble-APM.git
cd Bumble-APM
npm install
```

Create a `.env.local` file:

```
OPENROUTER_API_KEY=your_openrouter_key_here
```

Get a free key at [openrouter.ai](https://openrouter.ai).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

```
app/
├── page.tsx              # Client UI — profile selector, message input, scorecard
├── api/evaluate/
│   └── route.ts          # POST handler — calls OpenRouter, validates + returns JSON
lib/
├── profiles.ts           # Hardcoded mock match profiles
└── types.ts              # EvaluationResult + Tone types
```

The evaluation API accepts a `message` string and a `profileId`, looks up the profile server-side, and returns:

```json
{
  "is_safe": true,
  "tone": "Respectful",
  "pulse_score": 85,
  "coach_note": "Great job referencing Max and asking about hiking!",
  "reasoning_trace": "Message references a specific profile detail..."
}
```

The `reasoning_trace` field is surfaced in the Developer Logs drawer — this is the key architectural proof point: quantifying subjective safety and engagement into a baseline-driven quality gate is the infrastructure required for responsible, enterprise-grade AI deployment.

---

*Built by Ali Hasan as part of the Bumble APM application, 2026.*
