import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../store';
import { Chip, ChartSummary, ProgressBar } from '../components/ui';

export * from './labsB';

const LAB_LIST = [
  { to: 'rag', name: 'RAG Lab', desc: 'Chunk → retrieve → top-K + threshold, live.' },
  { to: 'embeddings', name: 'Embedding Visualization', desc: '2D demo semantic space, hover similarity.' },
  { to: 'agent', name: 'Agent Lab', desc: 'Step through a tool-calling trace.' },
  { to: 'eval', name: 'Evaluation Lab', desc: 'Accuracy, PR, faithfulness, latency, cost — live charts.' },
  { to: 'precision-recall', name: 'Precision/Recall Game', desc: 'Slide threshold, hit the target, earn XP.' },
  { to: 'data-quality', name: 'Data Quality Game', desc: 'Spot duplicates, bad labels, imbalance.' },
  { to: 'taxonomy', name: 'Taxonomy Builder', desc: 'Drag-and-drop classification + scoring.' },
  { to: 'tool-design', name: 'Tool Design Game', desc: 'Choose the right tools for the job.' },
  { to: 'workflow-agent', name: 'Workflow vs Agent', desc: 'Pick the simplest reliable architecture.' },
  { to: 'system-design', name: 'System Design Sim', desc: 'Assemble the feedback engine.' },
  { to: 'docker', name: 'Docker Visualizer', desc: 'Inspect a conceptual Compose app.' },
  { to: 'api', name: 'API Lab', desc: 'Methods + status codes + mini quiz.' },
  { to: 'debugging', name: 'Debugging Lab', desc: 'Works locally, fails in prod.' },
  { to: 'ambiguous', name: 'Ambiguous Problem Lab', desc: 'Unknowns → success → MVP → risks.' },
  { to: 'partner', name: 'Partner Role-Play', desc: 'Discovery questions, rubric graded.' },
];

export function LabsHub() {
  return (
    <div>
      <h1 className="page-title">Interactive labs</h1>
      <p className="page-sub">15 genuinely functional labs and games — every control does something. Demo data is labeled where synthetic.</p>
      <div className="grid grid-3">
        {LAB_LIST.map((l) => (
          <div key={l.to} className="card hoverable"><h3>{l.name}</h3><p className="small">{l.desc}</p><Link className="btn btn-sm" to={`/practice/labs/${l.to}`}>Open</Link></div>
        ))}
      </div>
    </div>
  );
}

function LabShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <div>
      <p><Chip kind="accent">Interactive lab</Chip> <Link to="/practice/labs" className="caption">← all labs</Link></p>
      <h1 className="page-title">{title}</h1>
      <p className="page-sub">{intro}</p>
      {children}
    </div>
  );
}

// ---------- 1. RAG Lab ----------
const DOCS = [
  { id: 'd1', title: 'Refund policy', text: 'Refunds are processed within 5 to 10 business days to the original payment method. Digital goods are refundable within 14 days.', vec: [0.9, 0.15] },
  { id: 'd2', title: 'Shipping guide', text: 'Standard shipping takes 3 to 5 days. Express is 1 to 2 days. Track from your orders page.', vec: [0.12, 0.9] },
  { id: 'd3', title: 'Refund exceptions', text: 'Final-sale items and gift cards are not refundable. Partial refunds apply to opened accessories.', vec: [0.82, 0.3] },
  { id: 'd4', title: 'Account security', text: 'Enable two-factor authentication. Never share one-time codes with support callers.', vec: [-0.6, 0.75] },
  { id: 'd5', title: 'Subscription cancel', text: 'Cancel anytime before renewal. Annual plans keep access until term end with prorated refunds where required.', vec: [0.55, 0.55] },
];
const QUERIES: Record<string, [number, number]> = {
  'How long do refunds take?': [0.88, 0.2],
  'Where is my package?': [0.1, 0.88],
  'Can I refund a gift card?': [0.8, 0.32],
};

export function RagLab() {
  const [query, setQuery] = useState('How long do refunds take?');
  const [topK, setTopK] = useState(2);
  const [threshold, setThreshold] = useState(0.5);
  const [chunk, setChunk] = useState(500);
  const { awardXp } = useApp();
  const cos = (a: [number, number], b: [number, number]) => (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b));
  const qv = QUERIES[query];
  const ranked = useMemo(() => {
    const jitter = chunk < 300 ? -0.06 : chunk > 800 ? -0.03 : 0; // tiny chunking penalty models coherence loss
    return DOCS.map((d) => ({ ...d, score: Math.max(0, Math.min(1, cos(qv, d.vec as [number, number]) + jitter)) })).sort((a, b) => b.score - a.score);
  }, [query, chunk]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = ranked.slice(0, topK);
  const passed = shown.filter((d) => d.score >= threshold);
  return (
    <LabShell title="RAG Lab" intro="Documents → chunking → embeddings → vector space → top-K. Tune controls and watch retrieval change live. Demo vectors, conceptual.">
      <div className="grid grid-2">
        <div className="card">
          <label>Query <select className="select-input" value={query} onChange={(e) => setQuery(e.target.value)}>{Object.keys(QUERIES).map((k) => <option key={k}>{k}</option>)}</select></label>
          <div className="lab-controls">
            <label>Top-K: {topK}<input type="range" min={1} max={5} value={topK} onChange={(e) => setTopK(Number(e.target.value))} aria-label="Top K" /></label>
            <label>Similarity threshold: {threshold.toFixed(2)}<input type="range" min={0} max={0.95} step={0.05} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} aria-label="Similarity threshold" /></label>
            <label>Chunk size: {chunk}<input type="range" min={150} max={1200} step={50} value={chunk} onChange={(e) => setChunk(Number(e.target.value))} aria-label="Chunk size" /></label>
          </div>
          <p className="caption muted">Chunk coherence model: very small or huge chunks slightly penalize scores (conceptual).</p>
          <button className="btn btn-sm" onClick={() => awardXp(15, 'RAG experiment')}>Log experiment +15 XP</button>
        </div>
        <div className="card">
          <h3>Vector space (conceptual 2D)</h3>
          <svg viewBox="0 0 300 220" className="flow-svg" role="img" aria-label="Demo vector space with documents and query">
            <line x1="150" y1="10" x2="150" y2="210" stroke="var(--border)" /><line x1="10" y1="110" x2="290" y2="110" stroke="var(--border)" />
            {DOCS.map((d) => {
              const x = 150 + d.vec[0] * 120; const y = 110 - d.vec[1] * 90;
              const hot = passed.some((p) => p.id === d.id);
              return <g key={d.id}><circle cx={x} cy={y} r={hot ? 9 : 6} fill={hot ? 'var(--accent)' : 'var(--surface-muted)'} stroke="var(--border-strong)" /><text x={x} y={y - 12} textAnchor="middle" fontSize="9" fill="var(--text-secondary)">{d.id}</text></g>;
            })}
            <g><circle cx={150 + qv[0] * 120} cy={110 - qv[1] * 90} r="8" fill="#16a34a" /><text x={150 + qv[0] * 120} y={110 - qv[1] * 90 - 12} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-primary)">Q</text></g>
          </svg>
          <ChartSummary text={`Query ${query}. Top result ${ranked[0].id} score ${ranked[0].score.toFixed(2)}.`} />
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h3>Retrieved (top-{topK}, threshold {threshold.toFixed(2)})</h3>
        {passed.length === 0 ? <div className="alert warning">No chunk passed the threshold — the correct RAG behavior is to say NOT FOUND and escalate, not confabulate.</div> :
          passed.map((d) => <div key={d.id} className="alert success" style={{ marginBottom: 6 }}><strong>[{d.id}] {d.title}</strong> · score {d.score.toFixed(2)}<br /><span className="small">{d.text}</span></div>)}
        {shown.filter((d) => d.score < threshold).map((d) => <div key={d.id} className="alert" style={{ marginBottom: 6 }}><strong>{d.id}</strong> filtered out (score {d.score.toFixed(2)} below threshold).</div>)}
        <div className="alert info" style={{ marginTop: 8 }}><strong>Grounded draft:</strong> {passed.length ? `“${passed[0].text}” [${passed[0].id}]` : 'NOT FOUND in sources — offer human help and log the query.'}</div>
      </div>
    </LabShell>
  );
}

// ---------- 2. Embedding Visualization ----------
const EMB_POINTS = [
  { w: 'refund', x: 80, y: 60 }, { w: 'reimbursement', x: 95, y: 70 }, { w: 'return', x: 70, y: 78 },
  { w: 'invoice', x: 120, y: 55 }, { w: 'shipping', x: 220, y: 70 }, { w: 'delivery', x: 235, y: 85 },
  { w: 'password', x: 75, y: 180 }, { w: 'two-factor', x: 95, y: 190 }, { w: 'login', x: 110, y: 175 },
];

export function EmbeddingLab() {
  const [hover, setHover] = useState<string | null>(null);
  const dist = (a: string, b: string) => {
    const A = EMB_POINTS.find((p) => p.w === a)!; const B = EMB_POINTS.find((p) => p.w === b)!;
    const d = Math.hypot(A.x - B.x, A.y - B.y);
    return Math.max(0, 1 - d / 250);
  };
  return (
    <LabShell title="Embedding Visualization" intro="Conceptual 2D demo space — hover a word to compare similarity. Demo data only, not real model output.">
      <div className="card">
        <svg viewBox="0 0 300 240" className="flow-svg" role="img" aria-label="Demo embedding space">
          {EMB_POINTS.map((p) => (
            <g key={p.w} onMouseEnter={() => setHover(p.w)} onFocus={() => setHover(p.w)} tabIndex={0}>
              <circle cx={p.x} cy={p.y} r={hover === p.w ? 10 : 7} fill={hover === p.w ? 'var(--accent)' : 'var(--surface-muted)'} stroke="var(--border-strong)" />
              <text x={p.x} y={p.y - 13} textAnchor="middle" fontSize="10" fill="var(--text-primary)">{p.w}</text>
            </g>
          ))}
        </svg>
        <div aria-live="polite" className="small" style={{ marginTop: 8 }}>
          {hover ? <span>Similarity to <strong>{hover}</strong>: {EMB_POINTS.filter((p) => p.w !== hover).map((p) => `${p.w} ${dist(hover, p.w).toFixed(2)}`).join(' · ')}</span> : 'Hover or focus a word to compare cosine-style similarity.'}
        </div>
        <p className="caption muted">Clusters = billing (left-top), logistics (right), auth (bottom). Real spaces have 100s–1000s of dims.</p>
      </div>
    </LabShell>
  );
}

// ---------- 3. Agent Lab ----------
const TRACE = [
  { step: 1, tool: 'search_tickets', input: '{"query":"refund late","limit":3}', output: '3 tickets: #41 late refund, #39 duplicate charge, #37 address change', latency: 320, tokens: 1240, cost: 0.0011 },
  { step: 2, tool: 'get_policy', input: '{"section":"refunds"}', output: '"Refunds take 5–10 business days…" (policy v12)', latency: 180, tokens: 640, cost: 0.0006 },
  { step: 3, tool: 'draft_reply', input: '{"ticket":41,"cite":["policy v12"]}', output: 'Draft with citation + NOT_FOUND-safe fallback', latency: 2100, tokens: 980, cost: 0.0018 },
  { step: 4, tool: 'escalate_to_human', input: '{"ticket":41,"reason":"amount>threshold"}', output: 'Queued for review with full trace', latency: 90, tokens: 120, cost: 0.0001 },
];

export function AgentLab() {
  const [step, setStep] = useState(0);
  const t = TRACE[step];
  const totals = TRACE.slice(0, step + 1).reduce((a, s) => ({ lat: a.lat + s.latency, tok: a.tok + s.tokens, cost: a.cost + s.cost }), { lat: 0, tok: 0, cost: 0 });
  return (
    <LabShell title="Agent Lab" intro="Step through a tool-calling trace for a late-refund ticket: tool, input, output, latency, tokens, cost.">
      <div className="card">
        <p><Chip kind="info">Step {step + 1}/{TRACE.length}</Chip> <Chip>{t.tool}</Chip></p>
        <div className="grid grid-2">
          <div><h3>Input</h3><pre>{t.input}</pre><h3>Output</h3><pre>{t.output}</pre></div>
          <div><h3>Telemetry</h3><div className="table-wrap"><table><tbody><tr><th>Latency</th><td>{t.latency} ms</td></tr><tr><th>Tokens</th><td>{t.tokens}</td></tr><tr><th>Cost</th><td>${t.cost.toFixed(4)}</td></tr></tbody></table></div>
            <p className="small" style={{ marginTop: 8 }}>Running totals: {totals.lat} ms · {totals.tok} tokens · ${totals.cost.toFixed(4)}</p></div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className="btn btn-sm" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
          <button className="btn btn-primary btn-sm" disabled={step === TRACE.length - 1} onClick={() => setStep(step + 1)}>Next step</button>
          <button className="btn btn-sm" onClick={() => setStep(0)}>Replay</button>
        </div>
        <ProgressBar value={step + 1} max={TRACE.length} label="agent trace progress" />
      </div>
    </LabShell>
  );
}

// ---------- 4. Evaluation Lab ----------
export function EvalLab() {
  const [acc, setAcc] = useState(0.86);
  const [faith, setFaith] = useState(0.9);
  const [lat, setLat] = useState(1.8);
  const [cost, setCost] = useState(0.004);
  const { awardXp } = useApp();
  const cm = useMemo(() => {
    const tp = Math.round(acc * 80); const fn = 80 - tp; const fp = Math.round((1 - acc) * 40); const tn = 40 - fp;
    return { tp, fp, fn, tn };
  }, [acc]);
  const p = cm.tp / Math.max(1, cm.tp + cm.fp); const r = cm.tp / Math.max(1, cm.tp + cm.fn);
  const line = [0.7, 0.78, 0.82, 0.85, acc].map((v, i) => ({ run: `v${i + 1}`, accuracy: v }));
  const radar = [{ m: 'Accuracy', v: acc }, { m: 'Faithfulness', v: faith }, { m: 'Speed', v: Math.max(0.1, 1 - lat / 5) }, { m: 'Economy', v: Math.max(0.1, 1 - cost / 0.02) }, { m: 'Recall', v: r }].map((d) => ({ ...d, v: Math.round(d.v * 100) }));
  return (
    <LabShell title="Evaluation Lab" intro="Move the sliders — accuracy, faithfulness, latency, cost — and watch line, bar, radar, confusion-matrix, and gauge views update live.">
      <div className="lab-controls">
        <label>Accuracy {acc.toFixed(2)}<input type="range" min={0.5} max={0.99} step={0.01} value={acc} onChange={(e) => setAcc(Number(e.target.value))} aria-label="Accuracy" /></label>
        <label>Faithfulness {faith.toFixed(2)}<input type="range" min={0.5} max={1} step={0.01} value={faith} onChange={(e) => setFaith(Number(e.target.value))} aria-label="Faithfulness" /></label>
        <label>Latency {lat.toFixed(1)}s<input type="range" min={0.3} max={5} step={0.1} value={lat} onChange={(e) => setLat(Number(e.target.value))} aria-label="Latency" /></label>
        <label>Cost ${cost.toFixed(4)}/q<input type="range" min={0.001} max={0.02} step={0.001} value={cost} onChange={(e) => setCost(Number(e.target.value))} aria-label="Cost" /></label>
      </div>
      <div className="grid grid-2">
        <div className="card"><h3>Accuracy over runs (line)</h3><ResponsiveContainer width="100%" height={180}><LineChart data={line}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="run" /><YAxis domain={[0.5, 1]} /><Tooltip /><Line type="monotone" dataKey="accuracy" stroke="#2563eb" strokeWidth={2} /></LineChart></ResponsiveContainer><ChartSummary text={`Accuracy trend ends at ${acc}.`} /></div>
        <div className="card"><h3>Quality radar</h3><ResponsiveContainer width="100%" height={180}><RadarChart data={radar} outerRadius={65}><PolarGrid /><PolarAngleAxis dataKey="m" tick={{ fontSize: 10 }} /><Radar dataKey="v" fill="#0e7490" fillOpacity={0.4} stroke="#0e7490" /></RadarChart></ResponsiveContainer></div>
        <div className="card"><h3>Precision / Recall / F1 (bar)</h3><ResponsiveContainer width="100%" height={180}><BarChart data={[{ k: 'Precision', v: +(p * 100).toFixed(1) }, { k: 'Recall', v: +(r * 100).toFixed(1) }, { k: 'F1', v: +((2 * p * r / Math.max(0.001, p + r)) * 100).toFixed(1) }]}><XAxis dataKey="k" /><YAxis domain={[0, 100]} /><Tooltip /><Bar dataKey="v" fill="#2563eb" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer><p className="caption muted">Screen-reader: precision {(p * 100).toFixed(1)}%, recall {(r * 100).toFixed(1)}%.</p></div>
        <div className="card"><h3>Confusion matrix + gauge</h3>
          <div className="table-wrap"><table><thead><tr><th></th><th>Pred +</th><th>Pred −</th></tr></thead><tbody><tr><th>Actual +</th><td>TP {cm.tp}</td><td>FN {cm.fn}</td></tr><tr><th>Actual −</th><td>FP {cm.fp}</td><td>TN {cm.tn}</td></tr></tbody></table></div>
          <p className="small">Faithfulness gauge: {(faith * 100).toFixed(0)}% · Latency {lat.toFixed(1)}s · Cost ${cost.toFixed(4)}/query</p>
          <ProgressBar value={faith * 100} label="faithfulness gauge" />
          <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => awardXp(15, 'eval explored')}>Log eval insight +15 XP</button>
        </div>
      </div>
    </LabShell>
  );
}

// ---------- 5. Precision/Recall Game ----------
const PR_DATA = Array.from({ length: 40 }, (_, i) => {
  const fraud = i < 12;
  const score = fraud ? 0.45 + ((i * 37) % 50) / 100 : ((i * 53) % 45) / 100;
  return { id: i, fraud, score: Math.min(0.99, score) };
});

export function PrecisionRecallLab() {
  const [thr, setThr] = useState(0.5);
  const { awardXp } = useApp();
  const [won, setWon] = useState(false);
  const tp = PR_DATA.filter((d) => d.fraud && d.score >= thr).length;
  const fp = PR_DATA.filter((d) => !d.fraud && d.score >= thr).length;
  const fn = PR_DATA.filter((d) => d.fraud && d.score < thr).length;
  const tn = PR_DATA.filter((d) => !d.fraud && d.score < thr).length;
  const prec = tp / Math.max(1, tp + fp); const rec = tp / Math.max(1, tp + fn);
  const f1 = (2 * prec * rec) / Math.max(0.001, prec + rec);
  const target = prec >= 0.75 && rec >= 0.75;
  const curve = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    const TP = PR_DATA.filter((d) => d.fraud && d.score >= t).length;
    const FP = PR_DATA.filter((d) => !d.fraud && d.score >= t).length;
    const FN = PR_DATA.filter((d) => d.fraud && d.score < t).length;
    const P = TP / Math.max(1, TP + FP); const R = TP / Math.max(1, TP + FN);
    return { t: t.toFixed(1), P: +(P * 100).toFixed(0), R: +(R * 100).toFixed(0) };
  });
  return (
    <LabShell title="Precision/Recall Game" intro="Slide the threshold over 40 sample transactions (12 fraud). Hit precision ≥ 75% AND recall ≥ 75% to win XP. Demo data.">
      <div className="grid grid-2">
        <div className="card">
          <label><strong>Threshold: {thr.toFixed(2)}</strong><input type="range" min={0} max={1} step={0.05} value={thr} onChange={(e) => setThr(Number(e.target.value))} aria-label="Classification threshold" style={{ width: '100%' }} /></label>
          <div className="table-wrap" style={{ marginTop: 10 }}><table><thead><tr><th></th><th>Pred fraud</th><th>Pred legit</th></tr></thead><tbody><tr><th>Is fraud</th><td>TP {tp}</td><td>FN {fn}</td></tr><tr><th>Legit</th><td>FP {fp}</td><td>TN {tn}</td></tr></tbody></table></div>
          <p className="small">Precision {(prec * 100).toFixed(1)}% · Recall {(rec * 100).toFixed(1)}% · F1 {(f1 * 100).toFixed(1)}%</p>
          <ProgressBar value={prec * 100} label="precision" /> <ProgressBar value={rec * 100} label="recall" />
          {target && !won && <div className="alert success" style={{ marginTop: 8 }}>Target hit! <button className="btn btn-sm btn-primary" onClick={() => { awardXp(60, 'PR target'); setWon(true); }}>Claim 60 XP</button></div>}
          {won && <div className="alert success">Claimed. Try threshold 0.9 vs 0.2 to feel the tradeoff.</div>}
        </div>
        <div className="card"><h3>P/R vs threshold</h3><ResponsiveContainer width="100%" height={240}><LineChart data={curve}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="t" /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="P" stroke="#2563eb" name="Precision %" /><Line type="monotone" dataKey="R" stroke="#0e7490" name="Recall %" /></LineChart></ResponsiveContainer><ChartSummary text={`At threshold ${thr}, precision ${(prec * 100).toFixed(0)}, recall ${(rec * 100).toFixed(0)}.`} /></div>
      </div>
    </LabShell>
  );
}

// ---------- 6. Data Quality Game ----------
const DQ_ITEMS = [
  { id: 'a', text: '"Where is my refund?" → billing', issue: null },
  { id: 'b', text: '"Where is my refund?" → billing (exact duplicate of a)', issue: 'duplicate' },
  { id: 'c', text: '"asdf jkl" → billing', issue: 'incorrect label' },
  { id: 'd', text: '"Cancel my subscription!!!" → (no label)', issue: 'missing label' },
  { id: 'e', text: '"My card was charged twice, please help urgently" → shipping', issue: 'incorrect label' },
  { id: 'f', text: '"Refund???" → billing', issue: 'ambiguous' },
  { id: 'g', text: '"Track my package" → shipping', issue: null },
  { id: 'h', text: '"wtf money gone" → (no label)', issue: 'missing label' },
];

export function DataQualityLab() {
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const { awardXp } = useApp();
  const correct = DQ_ITEMS.filter((d) => (marks[d.id] ?? 'ok') === (d.issue ?? 'ok')).length;
  return (
    <LabShell title="Data Quality Game" intro="8 labeled chats. Mark each: ok, duplicate, missing label, incorrect label, or ambiguous. Explanations after submit.">
      {DQ_ITEMS.map((d) => (
        <div key={d.id} className="card" style={{ marginBottom: 8 }}>
          <p className="small"><strong>{d.text}</strong></p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['ok', 'duplicate', 'missing label', 'incorrect label', 'ambiguous'].map((o) => (
              <button key={o} className={`btn btn-sm${marks[d.id] === o ? ' btn-primary' : ''}`} onClick={() => setMarks({ ...marks, [d.id]: o })}>{o}</button>
            ))}
          </div>
          {done && <p className="small" style={{ color: (marks[d.id] ?? 'ok') === (d.issue ?? 'ok') ? 'var(--success)' : 'var(--danger)' }}>{(marks[d.id] ?? 'ok') === (d.issue ?? 'ok') ? 'Correct. ' : `You said ${marks[d.id] ?? 'ok'}; truth is ${d.issue ?? 'ok'}. `}{explainDQ(d.issue)}</p>}
        </div>
      ))}
      <button className="btn btn-primary" onClick={() => { setDone(true); if (correct >= 6) awardXp(50, 'data quality'); }}>Submit ({correct}/{DQ_ITEMS.length})</button>
    </LabShell>
  );
}
function explainDQ(issue: string | null) {
  if (!issue) return 'Clean item — keep.';
  if (issue === 'duplicate') return 'Duplicates leak across splits and inflate metrics — dedupe before splitting.';
  if (issue === 'missing label') return 'Unlabeled rows teach nothing — route to labeling or drop explicitly.';
  if (issue === 'incorrect label') return 'Wrong labels teach wrong patterns — adjudicate with guidelines.';
  return 'Ambiguous — needs a guideline ruling or needs-review bucket, not a guess.';
}

// ---------- 7. Taxonomy Builder ----------
const TAX_ITEMS = [
  { id: 't1', text: '“Charged twice for order 42”', cat: 'billing' },
  { id: 't2', text: '“Where is my package?”', cat: 'shipping' },
  { id: 't3', text: '“Reset my password”', cat: 'account' },
  { id: 't4', text: '“Cancel subscription now”', cat: 'account' },
  { id: 't5', text: '“Refund my gift card”', cat: 'billing' },
  { id: 't6', text: '“Change delivery address”', cat: 'shipping' },
];
const TAX_CATS = ['billing', 'shipping', 'account'];

export function TaxonomyLab() {
  const [assign, setAssign] = useState<Record<string, string>>({ t1: 'billing' });
  const [done, setDone] = useState(false);
  const { awardXp } = useApp();
  const [dragId, setDragId] = useState<string | null>(null);
  const correct = TAX_ITEMS.filter((t) => assign[t.id] === t.cat).length;
  const acc = Math.round((correct / TAX_ITEMS.length) * 100);
  return (
    <LabShell title="Taxonomy Builder" intro="Drag (or use the dropdown) each message into billing / shipping / account. Scored on accuracy + consistency.">
      <div className="grid grid-2">
        <div className="card">
          <h3>Inbox</h3>
          {TAX_ITEMS.filter((t) => !Object.keys(assign).includes(t.id) || !assign[t.id]).concat(TAX_ITEMS.filter((t) => assign[t.id])).slice(0, 6).map((t) => (
            <div key={t.id} draggable onDragStart={() => setDragId(t.id)} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 8, marginBottom: 6, cursor: 'grab' }}>
              <span className="small">{t.text}</span>
              <select className="select-input" value={assign[t.id] ?? ''} onChange={(e) => setAssign({ ...assign, [t.id]: e.target.value })} aria-label={`Category for ${t.text}`} style={{ marginTop: 6 }}>
                <option value="">— drop or choose —</option>{TAX_CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="card">
          {TAX_CATS.map((c) => (
            <div key={c} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragId) { setAssign({ ...assign, [dragId]: c }); setDragId(null); } }} style={{ border: '1.5px dashed var(--border-strong)', borderRadius: 10, padding: 10, marginBottom: 8, minHeight: 70 }}>
              <strong>{c}</strong> ({TAX_ITEMS.filter((t) => assign[t.id] === c).length})
              {TAX_ITEMS.filter((t) => assign[t.id] === c).map((t) => <div key={t.id} className="small">• {t.text}</div>)}
            </div>
          ))}
          <button className="btn btn-primary btn-sm" onClick={() => { setDone(true); if (acc >= 83) awardXp(40, 'taxonomy'); }}>Score ({acc}%)</button>
          {done && <div style={{ marginTop: 8 }}>{TAX_ITEMS.map((t) => <p key={t.id} className="small" style={{ color: assign[t.id] === t.cat ? 'var(--success)' : 'var(--danger)' }}>{assign[t.id] === t.cat ? '✓' : `✗ (yours: ${assign[t.id] ?? '—'}, truth: ${t.cat})`} {t.text}</p>)}<div className="alert info">Consistency tip: write the edge rule (“gift-card refunds → billing even though card-related”) into guidelines so two labelers agree.</div></div>}
        </div>
      </div>
    </LabShell>
  );
}
