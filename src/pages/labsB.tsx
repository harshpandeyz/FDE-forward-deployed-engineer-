import React, { useMemo, useState } from 'react';
import { useApp } from '../store';
import { Chip } from '../components/ui';

// ---------- shared bits ----------
function LabShell({ title, label, children, intro }: { title: string; label: string; intro: string; children: React.ReactNode }) {
  return (
    <div>
      <p><Chip kind="accent">{label}</Chip></p>
      <h1 className="page-title">{title}</h1>
      <p className="page-sub">{intro}</p>
      {children}
    </div>
  );
}

// ---------- 8. Tool Design Game ----------
const TOOL_POOL = [
  { id: 'search_orders', good: true, why: 'Verb-first, scoped read. Good.' },
  { id: 'refund_order', good: true, why: 'Core write with idempotency + confirm. Good.' },
  { id: 'get_policy', good: true, why: 'Grounds answers in source. Good.' },
  { id: 'run_any_sql', good: false, why: 'Too powerful, no auth scoping. Bad — expose narrow reads instead.' },
  { id: 'helper_v2', good: false, why: 'Vague name, unknown params. Bad.' },
  { id: 'send_email_blast', good: false, why: 'Irreversible broadcast without confirm. Bad for this task.' },
  { id: 'escalate_to_human', good: true, why: 'Safe fallback path. Good.' },
];

export function ToolDesignLab() {
  const [picked, setPicked] = useState<string[]>(['search_orders']);
  const [done, setDone] = useState(false);
  const { awardXp } = useApp();
  const score = picked.filter((p) => TOOL_POOL.find((t) => t.id === p)?.good).length - picked.filter((p) => !TOOL_POOL.find((t) => t.id === p)?.good).length;
  return (
    <LabShell title="Tool Design Game" label="Interactive lab" intro="Pick the tools a refund-support agent should expose. Teaches naming, params, structured outputs, auth, and error messages.">
      <div className="grid grid-2">
        {TOOL_POOL.map((t) => (
          <label key={t.id} className="quiz-opt">
            <input type="checkbox" checked={picked.includes(t.id)} onChange={() => setPicked(picked.includes(t.id) ? picked.filter((x) => x !== t.id) : [...picked, t.id])} /> <code>{t.id}</code>
          </label>
        ))}
      </div>
      <div style={{ marginTop: 10 }}><button className="btn btn-primary" onClick={() => { setDone(true); if (score >= 3) awardXp(40, 'tool design'); }}>Evaluate design</button></div>
      {done && (
        <div className="card" style={{ marginTop: 10 }}>
          <h3>Score: {score} (need ≥3)</h3>
          {TOOL_POOL.map((t) => <p key={t.id} className="small"><code>{t.id}</code> — {t.why} {picked.includes(t.id) ? '(you picked it)' : '(skipped)'}</p>)}
          <div className="alert info">Rules: verb-first names, minimal typed params, auth per call, idempotency keys for writes, preview+confirm for destructive ops, errors that teach the next action.</div>
        </div>
      )}
    </LabShell>
  );
}

// ---------- 9. Workflow vs Agent Game ----------
const WF_SCENARIOS = [
  { id: 'w1', text: 'Classify tickets into 3 stable intents and reply with a macro.', answer: 'workflow' as const, why: 'Predictable steps → deterministic router. Cheaper, testable.' },
  { id: 'w2', text: 'Fix any failing CI pipeline across 40 repos with unknown errors.', answer: 'agent' as const, why: 'Wild inputs + recovery judgment → bounded agent with caps and sandbox.' },
  { id: 'w3', text: 'Nightly bulk-label 1M rows with a fixed schema.', answer: 'workflow' as const, why: 'Volume + fixed shape → pipeline, not per-row agency.' },
  { id: 'w4', text: 'Deep-research a vendor landscape from unknown sources.', answer: 'agent' as const, why: 'Open-ended gathering + planning → agent with memory and provenance.' },
];

export function WorkflowAgentLab() {
  const [ans, setAns] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const { awardXp } = useApp();
  const correct = WF_SCENARIOS.filter((s) => ans[s.id] === s.answer).length;
  return (
    <LabShell title="Workflow vs Agent Game" label="Interactive game" intro="Choose the simplest architecture that reliably works — not 'agents are always better.'">
      {WF_SCENARIOS.map((s) => (
        <div key={s.id} className="card" style={{ marginBottom: 10 }}>
          <p><strong>{s.text}</strong></p>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['workflow', 'agent'] as const).map((o) => (
              <button key={o} className={`btn btn-sm${ans[s.id] === o ? ' btn-primary' : ''}`} onClick={() => setAns({ ...ans, [s.id]: o })}>{o}</button>
            ))}
          </div>
          {done && <p className="small" style={{ color: ans[s.id] === s.answer ? 'var(--success)' : 'var(--danger)' }}>{ans[s.id] === s.answer ? 'Correct. ' : 'Not quite. '}{s.why}</p>}
        </div>
      ))}
      <button className="btn btn-primary" onClick={() => { setDone(true); if (correct >= 3) awardXp(40, 'workflow judgment'); }}>Submit ({correct}/{WF_SCENARIOS.length})</button>
    </LabShell>
  );
}

// ---------- 10. System Design Simulator ----------
const SIM_COMPONENTS = ['frontend', 'gateway', 'auth', 'router', 'llm', 'rag', 'vector-db', 'sql-db', 'cache', 'queue', 'worker', 'eval-service', 'logging'];

export function SystemDesignSimLab() {
  const [placed, setPlaced] = useState<string[]>(['frontend', 'gateway']);
  const [notes, setNotes] = useState<string[]>([]);
  const { awardXp } = useApp();
  const toggle = (c: string) => setPlaced(placed.includes(c) ? placed.filter((x) => x !== c) : [...placed, c]);
  const evaluate = () => {
    const msgs: string[] = [];
    const has = (x: string) => placed.includes(x);
    if (has('rag') && !has('vector-db')) msgs.push('Warning: RAG without a vector DB — where do embeddings live?');
    if ((has('rag') || has('llm')) && !has('eval-service')) msgs.push('Warning: no eval service — how do you catch regressions?');
    if ((has('llm') || has('agent' as never)) && !has('logging')) msgs.push('Warning: LLM traffic without logging — untraceable failures.');
    if (has('sql-db') && has('vector-db')) msgs.push('Success: system of record (SQL) separated from meaning index (vectors).');
    if (has('queue') && has('worker')) msgs.push('Success: async path isolated (ingest/reports) from sync queries.');
    if (has('cache')) msgs.push('Note: cache needs tenant-scoped keys + TTLs — never share personalized results.');
    if (has('gateway') && has('auth')) msgs.push('Success: auth at the gateway with per-tenant scoping.');
    if (!has('auth')) msgs.push('Warning: no auth component — who can see whose data?');
    if (msgs.length === 0) msgs.push('Add more components to get feedback.');
    setNotes(msgs);
    const wins = msgs.filter((m) => m.startsWith('Success')).length;
    if (wins >= 2) awardXp(50, 'system design sim');
  };
  return (
    <LabShell title="System Design Simulator" label="Interactive lab · practice feedback only" intro="Assemble a learning feedback engine. Feedback is warnings/success notes for learning — not an authoritative grade.">
      <p className="small">Click components to place/remove them:</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {SIM_COMPONENTS.map((c) => (
          <button key={c} className={`btn btn-sm${placed.includes(c) ? ' btn-primary' : ''}`} onClick={() => toggle(c)} aria-pressed={placed.includes(c)}>{c}</button>
        ))}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h3>Canvas ({placed.length} placed)</h3>
        <p className="small">{placed.join(' → ') || 'Empty — place components above.'}</p>
        <button className="btn btn-primary btn-sm" onClick={evaluate}>Check design</button>
        <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
          {notes.map((n, i) => <div key={i} className={n.startsWith('Success') ? 'alert success' : n.startsWith('Warning') ? 'alert warning' : 'alert info'}>{n}</div>)}
        </div>
      </div>
    </LabShell>
  );
}

// ---------- 11. Docker Visualizer ----------
const CONTAINERS: Record<string, { ports: string; network: string; env: string; volumes: string; notes: string }> = {
  api: { ports: '8000:8000', network: 'appnet (service name: api)', env: 'DATABASE_URL, REDIS_URL, MODEL_KEY (injected, not baked)', volumes: 'none (stateless)', notes: 'Healthcheck /healthz. Depends on db + redis.' },
  db: { ports: '5432 (internal only)', network: 'appnet (hostname: db)', env: 'POSTGRES_USER/PASSWORD/DB (secret store)', volumes: 'pgdata → /var/lib/postgresql/data (persistent)', notes: 'System of record. Backups + migrations run here.' },
  redis: { ports: '6379 (internal only)', network: 'appnet (hostname: redis)', env: 'none secret', volumes: 'redisdata → /data (cache, evictable)', notes: 'Hot-query cache + sessions. TTLs everywhere.' },
  worker: { ports: 'none', network: 'appnet', env: 'same as api + QUEUE_URL', volumes: 'none', notes: 'Consumes queue: ingestion, batch eval, reports. Scales horizontally.' },
};

export function DockerLab() {
  const [sel, setSel] = useState('api');
  const c = CONTAINERS[sel];
  return (
    <LabShell title="Docker Visualizer" label="Interactive lab · conceptual" intro="A conceptual multi-container app. Click a container to inspect ports, network, env, and volumes.">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.keys(CONTAINERS).map((k) => <button key={k} className={`btn btn-sm${sel === k ? ' btn-primary' : ''}`} onClick={() => setSel(k)}>{k}</button>)}
      </div>
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table><tbody>
          <tr><th scope="row">Container</th><td><code>{sel}</code></td></tr>
          <tr><th scope="row">Ports</th><td>{c.ports}</td></tr>
          <tr><th scope="row">Network</th><td>{c.network}</td></tr>
          <tr><th scope="row">Env</th><td>{c.env}</td></tr>
          <tr><th scope="row">Volumes</th><td>{c.volumes}</td></tr>
          <tr><th scope="row">Notes</th><td>{c.notes}</td></tr>
        </tbody></table>
      </div>
      <div className="alert warning" style={{ marginTop: 10 }}>Gotcha drill: from <code>api</code>, reach the DB at hostname <code>db</code> — not <code>localhost</code>. Secrets come from env at runtime.</div>
    </LabShell>
  );
}

// ---------- 12. API Lab ----------
const API_ROUTES: Record<string, { status: number; body: string; hint: string }> = {
  'GET /orders/42': { status: 200, body: '{"id":42,"status":"shipped"}', hint: 'OK — resource found.' },
  'POST /refunds': { status: 201, body: '{"refund_id":"r_9","state":"pending_approval"}', hint: 'Created — write succeeded, gated by approval.' },
  'POST /refunds (dup key)': { status: 409, body: '{"error":"idempotency_key_reused"}', hint: 'Conflict — same key, do not blindly retry; fetch state.' },
  'GET /admin': { status: 401, body: '{"error":"missing_token"}', hint: 'Unauthorized — attach Bearer token.' },
  'GET /others-data': { status: 403, body: '{"error":"forbidden_scope"}', hint: 'Forbidden — authenticated but out of scope.' },
  'GET /nope': { status: 404, body: '{"error":"not_found"}', hint: 'Not found — check ID/route.' },
  'GET /burst': { status: 429, body: '{"error":"rate_limited","retry_after":2}', hint: 'Slow down — backoff + Retry-After.' },
  'GET /flaky': { status: 503, body: '{"error":"upstream_unavailable"}', hint: 'Retry with backoff; circuit-break after N.' },
};

export function ApiLab() {
  const [route, setRoute] = useState('GET /orders/42');
  const [log, setLog] = useState<string[]>([]);
  const [quiz, setQuiz] = useState(0);
  const r = API_ROUTES[route];
  const send = () => {
    setLog([`${new Date().toLocaleTimeString()} ${route} → ${r.status}`, ...log].slice(0, 8));
  };
  return (
    <LabShell title="API Lab" label="Interactive lab" intro="Simulate requests and read status codes like a contract. 200/201/400/401/403/404/409/429/500/503 covered.">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select className="select-input" value={route} onChange={(e) => setRoute(e.target.value)} aria-label="Choose request" style={{ maxWidth: 320 }}>
          {Object.keys(API_ROUTES).map((k) => <option key={k}>{k}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={send}>Send</button>
      </div>
      <div className="grid grid-2" style={{ marginTop: 12 }}>
        <div className="card"><h3>Response</h3><p><Chip kind={r.status < 300 ? 'success' : r.status < 500 ? 'warning' : 'danger'}>{r.status}</Chip></p><pre>{r.body}</pre><p className="small">{r.hint}</p></div>
        <div className="card"><h3>Request log</h3>{log.length === 0 ? <p className="caption muted">No requests yet.</p> : <ul>{log.map((l, i) => <li key={i} className="small"><code>{l}</code></li>)}</ul>}
          <div className="divider" /><h3>Mini quiz</h3>
          <p className="small">POST /refund returns 409. You…</p>
          {['Retry instantly 10×', 'Fetch current state; resolve key/state first'].map((o, i) => (
            <button key={i} className="quiz-opt" style={{ marginBottom: 6 }} onClick={() => setQuiz(i + 1)}>{o}</button>
          ))}
          {quiz === 2 && <div className="alert success">Correct — 409 means resolve, not hammer.</div>}
          {quiz === 1 && <div className="alert error">Incorrect because retries amplify conflicts. Remember: read state first.</div>}
        </div>
      </div>
    </LabShell>
  );
}

// ---------- 13. Debugging Lab ----------
const DEBUG_LOGS = [
  '2026-09-01T10:02:11Z INFO api listening on :8000 (commit a1b2c3)',
  '2026-09-01T10:02:12Z INFO worker connected to queue',
  '2026-09-01T10:03:40Z ERROR db connect failed: connection refused to localhost:5432 (attempt 3)',
  '2026-09-01T10:03:40Z WARN retrying with backoff…',
  '2026-09-01T10:04:02Z ERROR healthcheck /healthz failing (5/5)',
];
const DEBUG_OPTS = ['App code algorithm is wrong', 'DB host still localhost in prod env (should be service/host name)', 'Users need new phones', 'Model temperature too high'];

export function DebugLab() {
  const [reveal, setReveal] = useState<string[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const { awardXp } = useApp();
  return (
    <LabShell title="Debugging Lab: works locally, fails in prod" label="Interactive lab" intro="Investigate logs step by step, then name the real cause. Reasoning sequence shown after.">
      <div className="card">
        <h3>Step 1 — Reveal logs in order</h3>
        {DEBUG_LOGS.map((l, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            {reveal.includes(String(i)) ? <pre style={{ margin: 0 }}>{l}</pre> : <button className="btn btn-sm" onClick={() => setReveal([...reveal, String(i)])}>Reveal line {i + 1}</button>}
          </div>
        ))}
      </div>
      {reveal.length >= 3 && (
        <div className="card" style={{ marginTop: 10 }}>
          <h3>Step 2 — What is the real cause?</h3>
          {DEBUG_OPTS.map((o) => <button key={o} className={`quiz-opt${pick === o ? ' correct' : ''}`} style={{ marginBottom: 6 }} onClick={() => setPick(o)}>{o}</button>)}
          <button className="btn btn-primary btn-sm" disabled={!pick} onClick={() => { setDone(true); if (pick === DEBUG_OPTS[1]) awardXp(40, 'debugging'); }}>Diagnose</button>
          {done && (
            <div style={{ marginTop: 8 }}>
              {pick === DEBUG_OPTS[1] ? <div className="alert success">Correct.</div> : <div className="alert error">Incorrect because “connection refused to localhost:5432” in prod points at env/host config, not algorithms or phones.</div>}
              <ol className="small"><li>Read the failing line first (connection refused + localhost).</li><li>Diff env: prod DATABASE_URL vs local.</li><li>Fix host to service name, redeploy, verify /healthz.</li><li>Add a startup check that fails fast on localhost-in-prod.</li></ol>
            </div>
          )}
        </div>
      )}
    </LabShell>
  );
}

// ---------- 14. Ambiguous Problem Lab ----------
export function AmbiguousLab() {
  const [f, setF] = useState({ unknowns: '', success: '', mvp: '', risks: '' });
  const [done, setDone] = useState(false);
  const { awardXp } = useApp();
  const scores = useMemo(() => ({
    unknowns: f.unknowns.trim().length > 40 ? 2 : f.unknowns.trim().length > 10 ? 1 : 0,
    success: /\d/.test(f.success) ? 2 : f.success.trim().length > 10 ? 1 : 0,
    mvp: f.mvp.trim().length > 40 ? 2 : f.mvp.trim().length > 10 ? 1 : 0,
    risks: f.risks.trim().length > 30 ? 2 : f.risks.trim().length > 10 ? 1 : 0,
  }), [f]);
  const total = scores.unknowns + scores.success + scores.mvp + scores.risks;
  return (
    <LabShell title="Ambiguous Problem Lab" label="Interactive lab · practice" intro="Brief: 'Make support faster with AI.' Turn fog into a plan: unknowns, success metric, MVP slice, risks.">
      {(['unknowns', 'success', 'mvp', 'risks'] as const).map((k) => (
        <div key={k} style={{ marginBottom: 10 }}>
          <label style={{ fontWeight: 700, fontSize: 14 }}>{k === 'unknowns' ? 'Unknowns (list ≥3)' : k === 'success' ? 'Success (one metric + number + timeframe)' : k === 'mvp' ? 'MVP slice (thinnest end-to-end)' : 'Risks + mitigations'}<textarea className="text-input" rows={3} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-label={k} /></label>
        </div>
      ))}
      <button className="btn btn-primary" onClick={() => { setDone(true); if (total >= 6) awardXp(50, 'ambiguity'); }}>Get rubric feedback</button>
      {done && (
        <div className="card" style={{ marginTop: 10 }}>
          <h3>Rubric: {total}/8 {total >= 6 ? '(strong)' : total >= 4 ? '(developing)' : '(needs work)'}</h3>
          <ul className="small"><li>Unknowns {scores.unknowns}/2 — name data, users, access, constraints explicitly.</li><li>Success {scores.success}/2 — must include a number (e.g. −20% handle time in 6 wks).</li><li>MVP {scores.mvp}/2 — one slice with eval, not a platform.</li><li>Risks {scores.risks}/2 — each risk needs a mitigation + owner.</li></ul>
          <div className="alert info">Example strong slice: RAG drafts + citations for top-5 billing intents, human sends, NOT_FOUND path, freshness check. Success: −20% median handle time on billing in 6 weeks.</div>
        </div>
      )}
    </LabShell>
  );
}

// ---------- 15. Partner Role-Play ----------
const PARTNER_QS = [
  'What does “good” look like in numbers and by when?',
  'Can I watch how it is done today (screen share / shadow)?',
  'Who is harmed if the AI is wrong — what is the review path?',
  'What data can we touch / not touch (PII, retention, access)?',
  'What would make your team stop using this?',
  'Who owns the go/no-go call and the rollout?',
];

export function PartnerLab() {
  const [asked, setAsked] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const { awardXp, dispatch } = useApp();
  const coverage = asked.length;
  const clarity = asked.includes(PARTNER_QS[0]) && asked.includes(PARTNER_QS[2]) ? 2 : asked.length >= 3 ? 1 : 0;
  const risk = (asked.includes(PARTNER_QS[2]) ? 1 : 0) + (asked.includes(PARTNER_QS[3]) ? 1 : 0);
  const total = Math.min(5, coverage >= 4 ? 3 : coverage >= 2 ? 2 : 1) + Math.min(5, clarity + risk + 1);
  const avg = Math.round((total / 2) * 10) / 10;
  return (
    <LabShell title="Partner Role-Play" label="Interactive lab · rubric graded" intro="Partner: 'We need AI for onboarding docs… something smart, soon.' Ask clarifying questions. Graded on a rubric (coverage, clarity, risk awareness, feasibility, prioritization) — no single correct script.">
      <div className="card" style={{ marginBottom: 10 }}><p><strong>Partner:</strong> “Our onboarding docs are everywhere. New hires take weeks. Can you make AI fix it? We need it next month. Budget… let us see.”</p></div>
      <p className="small">Click the questions you would ask (pick ≥4):</p>
      <div className="grid">
        {PARTNER_QS.map((q) => (
          <button key={q} className={`quiz-opt${asked.includes(q) ? ' correct' : ''}`} onClick={() => setAsked(asked.includes(q) ? asked.filter((x) => x !== q) : [...asked, q])}>{q}</button>
        ))}
      </div>
      <button className="btn btn-primary" style={{ marginTop: 10 }} disabled={asked.length < 2} onClick={() => { setDone(true); if (avg >= 3.5) { awardXp(50, 'partner role-play'); dispatch({ type: 'AWARD_BADGE', id: 'partner-pro' }); } }}>Grade on rubric</button>
      {done && (
        <div className="card" style={{ marginTop: 10 }}>
          <h3>Rubric avg: {avg}/5 {(avg >= 3.5 ? '(strong — badge earned)' : '(keep practicing)')}</h3>
          <ul className="small"><li>Coverage {Math.min(5, asked.length + 1)}/5 — breadth of discovery.</li><li>Clarity {Math.min(5, clarity + 3)}/5 — success metric + decision owner.</li><li>Risk awareness {Math.min(5, risk + 3)}/5 — harm + PII/access.</li><li>Feasibility & prioritization — did you sequence a thin slice for “next month”?</li></ul>
          <div className="alert info">Strong close: “For next month I propose searchable cited answers over the top-20 docs with a freshness check and human feedback loop, measured by time-to-first-answer. Full automation comes later.”</div>
        </div>
      )}
    </LabShell>
  );
}
