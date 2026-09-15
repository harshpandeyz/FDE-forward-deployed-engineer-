export interface Achievement { id: string; name: string; desc: string; icon: string; check: string }

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-steps', name: 'First Steps', desc: 'Complete your first lesson.', icon: 'Footprints', check: 'completedLessons>=1' },
  { id: 'quiz-rookie', name: 'Quiz Rookie', desc: 'Score 70%+ on any quiz.', icon: 'Target', check: 'quiz>=70' },
  { id: 'rag-explorer', name: 'RAG Explorer', desc: 'Complete the RAG lesson + open RAG Lab.', icon: 'Search', check: 'rag' },
  { id: 'agent-tamer', name: 'Agent Tamer', desc: 'Finish Tool Calling + Workflows vs Agents.', icon: 'Bot', check: 'agents' },
  { id: 'metric-master', name: 'Metric Master', desc: 'Score 80%+ on an Evaluation quiz.', icon: 'Gauge', check: 'eval80' },
  { id: 'streak-3', name: '3-Day Streak', desc: 'Learn 3 days in a row.', icon: 'Flame', check: 'streak3' },
  { id: 'streak-7', name: 'Week Warrior', desc: 'Learn 7 days in a row.', icon: 'CalendarCheck', check: 'streak7' },
  { id: 'marathon', name: 'Marathoner', desc: 'Earn 1,500 XP.', icon: 'Trophy', check: 'xp1500' },
  { id: 'architect', name: 'Systems Architect', desc: 'Complete AI System Design + System Design Sim.', icon: 'Network', check: 'sysdesign' },
  { id: 'partner-pro', name: 'Partner Pro', desc: 'Finish Partner Role-Play with rubric avg ≥ 3.5.', icon: 'Handshake', check: 'partner' },
  { id: 'interviewer', name: 'Mock Ready', desc: 'Finish a full interview simulation.', icon: 'Mic', check: 'mock' },
  { id: 'scholar', name: 'Scholar', desc: 'Complete 15 lessons.', icon: 'GraduationCap', check: 'lessons15' },
];

export interface Tradeoff { id: string; title: string; a: string; b: string; aWins: string; bWins: string; cost: string; complexity: string; reliability: string; example: string }

export const TRADEOFFS: Tradeoff[] = [
  { id: 't-rag-ft', title: 'RAG vs Fine-tuning', a: 'RAG (retrieve at answer time)', b: 'Fine-tune weights', aWins: 'Volatile facts, citations needed, fast updates', bWins: 'Stable style/behavior, offline, low per-call tokens', cost: 'RAG: retrieval infra + tokens; FT: training + hosting', complexity: 'RAG: pipeline; FT: data + training + eval', reliability: 'RAG: grounded but retrieval-dependent; FT: fluent but can stale-hallucinate', example: 'Course policies → RAG; brand voice → FT the style, RAG the facts.' },
  { id: 't-wf-agent', title: 'Workflow vs Agent', a: 'Deterministic workflow', b: 'Autonomous agent', aWins: 'Predictable steps, cheap, testable', bWins: 'Wild inputs needing judgment + recovery', cost: 'Workflow: 1–3 calls; Agent: 5–15+ calls', complexity: 'Workflow: linear; Agent: loops, budgets, traces', reliability: 'Workflow higher per path; agent broader coverage with guardrails', example: 'Refund triage → workflow; unknown CI failures → bounded agent.' },
  { id: 't-sql-nosql', title: 'SQL vs NoSQL', a: 'Postgres (relational)', b: 'Document/KV store', aWins: 'Integrity, joins, transactions, audit', bWins: 'Flexible schema, horizontal scale, blobs', cost: 'Similar ops; NoSQL shards easier', complexity: 'SQL: migrations; NoSQL: app-level integrity', reliability: 'SQL constraints prevent bad states', example: 'Tickets/users → SQL; sessions/raw events → KV.' },
  { id: 't-cache', title: 'Cache vs No-cache', a: 'Cache hot results', b: 'Always recompute', aWins: 'Latency + cost for stable, shared answers', bWins: 'Personalized, PII, fast-changing truth', cost: 'Cache saves tokens/compute; invalidation work', complexity: 'Keys, TTLs, purge paths', reliability: 'Stale risk — version keys, scope by tenant', example: 'FAQ answers → cache; my-orders → never share cache.' },
  { id: 't-sync-async', title: 'Sync vs Async', a: 'Sync request/response', b: 'Queue + worker', aWins: 'Fast (<10s), user waits', bWins: 'Slow/batch, bursty, retryable', cost: 'Sync: simple; Async: infra + observability', complexity: 'Status, DLQs, idempotency', reliability: 'Async survives bursts + partial failure', example: 'Chat answer → sync; weekly report → async.' },
  { id: 't-small-large', title: 'Small vs Large model', a: 'Small/fast model', b: 'Large/frontier model', aWins: 'Triage, routing, high-volume, low latency', bWins: 'Hard reasoning, low-data, high-stakes drafts', cost: 'Small 5–20× cheaper per token', complexity: 'Routing + eval per tier', reliability: 'Route by difficulty; verify on golden set', example: 'Classify → small; final appeal letter → large + review.' },
  { id: 't-local-api', title: 'Local vs API inference', a: 'Self-hosted / edge', b: 'Managed API', aWins: 'Data stays put, predictable latency offline', bWins: 'Best quality, zero ops, fast iteration', cost: 'Local: GPUs + ops; API: per-token', complexity: 'Local: serving + scaling; API: vendor + limits', reliability: 'API wins on quality; local wins on control', example: 'Regulated PII extraction → local small; general copilot → API.' },
  { id: 't-acc-lat', title: 'Accuracy vs Latency', a: 'Max accuracy', b: 'Min latency', aWins: 'Refunds, bans, legal-adjacent (review anyway)', bWins: 'Autocomplete, triage, live chat', cost: 'Accuracy costs tokens + rerank + big models', complexity: 'Cascades: fast first, escalate hard', reliability: 'Meet the UX budget, then buy quality', example: '+2% for 4× latency: yes for refunds, no for typeahead.' },
  { id: 't-p-r', title: 'Precision vs Recall', a: 'High precision', b: 'High recall', aWins: 'False action costly (ban/refund)', bWins: 'Miss costly (triage/escalation)', cost: 'Threshold from FP/FN costs', complexity: 'Review band between thresholds', reliability: 'Report matrix, not accuracy alone', example: 'Auto-ban → precision; tumor-triage (educational) → recall + review.' },
  { id: 't-auto-human', title: 'Automation vs Human-in-the-loop', a: 'Full automation', b: 'Human reviews', aWins: 'Low-stakes, reversible, high-volume', bWins: 'Irreversible, regulated, low-confidence', cost: 'Humans cost time; errors cost trust', complexity: 'Queues, SLAs, audit', reliability: 'Gate blast radius + uncertainty', example: 'FAQ send → auto; refund >$50 → approve.' },
];
