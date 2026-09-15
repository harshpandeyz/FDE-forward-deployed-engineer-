# FDE AI Interview Lab

An interactive learning web app for **Forward Deployed Engineer / Applied AI interview preparation** — 10 curriculum phases, 25 deep lessons, 15 working labs, an 81-question practice bank, and a timed mock-interview simulator.

> **Content honesty:** everything is labeled as **Verified role information**, **General industry preparation**, or **Interview prediction / practice scenario**. Practice questions are rehearsal only — never presented as real or internal questions from any employer. This app guarantees no interview or job outcome and is not an official test.

## Features

- **Learn** — 25 copy-complete lessons (LLMs, tokens/context, prompting, embeddings, vector search, RAG, RAG eval, tool calling, workflows-vs-agents, agent architecture/memory/eval, precision/recall/F1, data quality, taxonomies, Python for AI, REST, databases, Docker, observability, AI system design, ambiguity, partner engineering, project stories, final prep) with diagrams, code, mini-quizzes, sources + last-verified dates
- **Practice** — quiz engine (MCQ, multi-answer, true/false, scenario, code-reasoning) with explanations on every miss; 34 spaced-repetition flashcards; 11-scenario library; coding drills; 10 tradeoff cards; timed answer trainer (30s / 60s / 2-min, DRET + STAR frames)
- **15 interactive labs** — RAG tuning (top-K / threshold / chunk size), embedding space, agent trace stepper, eval charts, precision/recall threshold game, data-quality game, taxonomy builder (drag-and-drop), tool-design game, workflow-vs-agent judge, system-design simulator, Docker visualizer, API status-code sim, production-debugging drill, ambiguity lab, partner role-play with rubric grading
- **Interview simulator** — 12 timed sections (intro → fundamentals → RAG → agents → eval → Python → systems → infra → ambiguity → partner → project → design), self-ratings + model framings, transparent weighted **practice readiness estimate** (Knowledge 25 / Practical 25 / AI systems 20 / Engineering 15 / Communication 15)
- **Gamification** — XP, 7 levels (AI Explorer → Forward Deployed Engineer), 12 badges, daily streak with contribution calendar, daily missions
- **Dashboard** — 10-question diagnostic onboarding, readiness ring with per-topic breakdown, continue-learning CTA, mastery-driven recommendations (never random)
- **Ownership tools** — project Story Builder (generates from your real details only, never invents), bookmarks, per-lesson notes, Review page, progress analytics, JSON export/import
- **Platform** — light/dark themes, responsive (desktop sidebar → tablet → mobile bottom nav, no overflow down to 320px), keyboard nav, ARIA labels, screen-reader chart summaries, `prefers-reduced-motion` support

## Tech stack

React 18 · Vite 6 · TypeScript · react-router-dom · Recharts · Lucide React · React Context + useReducer (no Redux) · single-key localStorage persistence · no backend

## Getting started

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # type-check + production build → dist/
npm run preview  # serve the production build
```

Requires Node 18+.

## Project structure

```
src/
  main.tsx, App.tsx (route table), index.css (design tokens + responsive)
  types.ts                    # Lesson / Question / UserProgress entities, level ladder
  store.tsx                   # Context+useReducer, streaks, mastery, SRS, XP
  utils/storage.ts            # sole localStorage abstraction
  utils/scoring.ts            # quiz scoring, readiness weighting
  components/ui.tsx           # chips, rings, flow/architecture diagrams
  components/layout.tsx       # sidebar, topbar + global search, bottom nav
  data/                       # modules, lessons (25), questions (81),
                              # flashcards (34), scenarios (11), extras
  pages/core.tsx              # Home, Dashboard + diagnostic, 404
  pages/learn.tsx             # curriculum hub + lesson engine
  pages/practice.tsx          # quizzes, flashcards, scenarios, drills, trainer
  pages/labs.tsx, labsB.tsx   # 15 interactive labs
  pages/interview.tsx         # timed simulator
  pages/more.tsx              # story builder, analytics, achievements, review, settings
```

## Persistence

All state lives in one localStorage key via `storageService` — lessons, quiz history, mastery, XP, streaks, badges, bookmarks, notes, flashcard schedules, interview runs, missions. Export/import from **Settings**. No data leaves the device.

## License

For personal interview-preparation use. Lesson sources are cited per lesson; code examples are original and free to reuse.
