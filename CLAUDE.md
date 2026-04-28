# AI Lead Qualifier — CLAUDE.md

## WAT Framework

This project is organized around the **WAT** framework:

| Layer | Folder | Purpose |
|---|---|---|
| **W** — Workflows | `workflows/` | Trigger.dev task definitions, AI prompts, qualification logic |
| **A** — Agent | *(Claude Code)* | You — building, editing, and running everything |
| **T** — Tools | `tools/` | Helper scripts for local testing, seeding, and automation |

The frontend lives in `frontend/` and is deployed separately to Vercel.

---

## Project Overview

The user fills out a lead form in the Next.js frontend, clicks **Analyze**, and the result is displayed on the same page. Under the hood:

1. The frontend calls its own Next.js API route (`/api/qualify`).
2. That route calls the Trigger.dev task using `triggerAndWait` (blocking — waits for the result).
3. The Trigger.dev task runs the AI qualification and returns a structured result.
4. The frontend renders the qualification output.

---

## Repo Structure

```
Lead Qualifier-Fullstack/
├── CLAUDE.md                          ← you are here
│
├── workflows/                         # W layer
│   └── lead-qualifier/
│       ├── trigger.config.ts          # Trigger.dev project config
│       ├── package.json
│       ├── src/
│       │   └── tasks/
│       │       └── qualifyLead.ts     # Main Trigger.dev task
│       └── prompts/
│           └── qualify-lead.md        # System prompt for the AI qualifier
│
├── tools/                             # T layer
│   └── test-qualify.ts                # Local script to test the task end-to-end
│
└── frontend/                          # Next.js app (Vercel)
    ├── package.json
    ├── next.config.ts
    ├── .env.local                      # Never committed
    ├── app/
    │   ├── page.tsx                   # Lead form UI + result display
    │   ├── components/
    │   │   ├── LeadForm.tsx
    │   │   └── QualificationResult.tsx
    │   └── api/
    │       └── qualify/
    │           └── route.ts           # Server-side proxy to Trigger.dev
    └── lib/
        └── types.ts                   # Shared input/output types
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI Workflow runtime | [Trigger.dev](https://trigger.dev) |
| AI Model | Claude (via Anthropic SDK inside the task) |
| Frontend | Next.js (App Router) |
| Frontend hosting | Vercel (connected to GitHub) |
| Language | TypeScript throughout |

---

## W — Workflows Layer (`workflows/`)

### What goes here
- Trigger.dev task files (`src/tasks/`)
- The AI system prompt (`prompts/qualify-lead.md`)
- The `trigger.config.ts` project configuration

### Key file: `qualifyLead.ts`
This is the Trigger.dev task. It receives a lead payload, calls Claude with the system prompt, and returns a structured qualification result.

### Key file: `prompts/qualify-lead.md`
The system prompt that tells Claude how to evaluate a lead. Edit this to tune qualification criteria without touching task code.

### Environment variables (Trigger.dev project)
```
ANTHROPIC_API_KEY=sk-ant-...
```
Set these in the Trigger.dev dashboard under **Project → Environment Variables**.

### Dev server
```bash
cd workflows/lead-qualifier
npx trigger.dev@latest dev
```

### Deploy
```bash
cd workflows/lead-qualifier
npx trigger.dev@latest deploy
```

---

## T — Tools Layer (`tools/`)

### `test-qualify.ts`
A standalone script to trigger the `qualifyLead` task locally and print the result. Run it while the Trigger.dev dev server is active.

```bash
cd tools
npx tsx test-qualify.ts
```

Add more scripts here for: seeding test leads, batch-testing prompts, checking Trigger.dev run logs.

---

## Frontend Layer (`frontend/`)

### Lead form flow
1. `app/page.tsx` renders the `<LeadForm />` component.
2. On submit, it POSTs to `/api/qualify` with the lead data.
3. `/api/qualify/route.ts` calls `triggerAndWait('qualify-lead', payload)` using the Trigger.dev SDK.
4. The result is returned to the page and rendered by `<QualificationResult />`.

### Environment variables (`.env.local` — never commit)
```
TRIGGER_SECRET_KEY=tr_dev_...        # From Trigger.dev dashboard → API Keys
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For Vercel production, add `TRIGGER_SECRET_KEY` (the production key) in **Vercel → Project → Settings → Environment Variables**.

### Dev server
```bash
cd frontend
npm install
npm run dev
```

### Deploy
Push to `main` on GitHub. Vercel auto-deploys. Make sure the production `TRIGGER_SECRET_KEY` is set in Vercel.

---

## Communication Contract

### Input (frontend → Trigger.dev task)
```ts
type LeadInput = {
  companyName: string;
  website?: string;
  contactName: string;
  contactEmail: string;
  jobTitle?: string;
  companySize?: string;
  industry?: string;
  useCase?: string;        // What they want to use the product for
  notes?: string;          // Any extra context
};
```

### Output (Trigger.dev task → frontend)
```ts
type QualificationResult = {
  score: number;           // 0–100
  tier: 'hot' | 'warm' | 'cold' | 'disqualified';
  summary: string;         // 2–3 sentence human-readable summary
  strengths: string[];
  concerns: string[];
  recommendedAction: string;
};
```

Both types live in `frontend/lib/types.ts` and are imported into the task and the API route.

---

## Local Dev Workflow

Run both servers in parallel (two terminals):

**Terminal 1 — Trigger.dev:**
```bash
cd workflows/lead-qualifier
npx trigger.dev@latest dev
```

**Terminal 2 — Next.js:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`, fill out the form, click Analyze.

---

## Deploy Checklist

- [ ] `ANTHROPIC_API_KEY` set in Trigger.dev dashboard (production environment)
- [ ] `TRIGGER_SECRET_KEY` (production key) set in Vercel environment variables
- [ ] `npx trigger.dev@latest deploy` run from `workflows/lead-qualifier/`
- [ ] GitHub repo connected to Vercel project
- [ ] Push to `main` triggers Vercel build and deploy
