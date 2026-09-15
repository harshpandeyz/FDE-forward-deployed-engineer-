import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Shuffle, Timer, Layers, MessagesSquare, Code2, Network, Scale, RotateCcw } from 'lucide-react';
import { QUESTIONS } from '../data/questions';
import { FLASHCARDS } from '../data/flashcards';
import { SCENARIOS } from '../data/scenarios';
import { TRADEOFFS } from '../data/extras';
import { useApp } from '../store';
import { Chip, Empty } from '../components/ui';
import { scoreQuiz } from '../utils/scoring';

const CATS = ['All', ...Array.from(new Set(QUESTIONS.map((q) => q.category)))];

// ---------- Hub ----------
export function PracticeHub() {
  return (
    <div>
      <h1 className="page-title">Practice</h1>
      <p className="page-sub">Every question is labeled a <em>practice question</em> — rehearsal, never claimed as real employer questions.</p>
      <div className="grid grid-3">
        <div className="card hoverable"><h3>Quiz engine</h3><p>{QUESTIONS.length} questions · MCQ, multi-answer, true/false, scenario, code-reasoning. Real explanations on every miss.</p><Link className="btn btn-primary btn-sm" to="/practice/quiz">Start quiz <ArrowRight size={14} /></Link></div>
        <div className="card hoverable"><h3>Flashcards ({FLASHCARDS.length})</h3><p>Flip + Again/Hard/Good/Easy spaced repetition, persisted.</p><Link className="btn btn-sm" to="/practice/flashcards">Review cards</Link></div>
        <div className="card hoverable"><h3>Scenarios ({SCENARIOS.length})</h3><p>Customer support, fraud, dev agent, eval platform + more, each with eval + failure cases.</p><Link className="btn btn-sm" to="/practice/scenarios">Open library</Link></div>
        <div className="card hoverable"><h3>15 interactive labs</h3><p>RAG, embeddings, agents, eval, Docker, APIs, debugging, role-plays…</p><Link className="btn btn-sm" to="/practice/labs">Open labs</Link></div>
        <div className="card hoverable"><h3>Coding reasoning</h3><p>Timeouts, parsing, async — the Python you actually use.</p><Link className="btn btn-sm" to="/practice/coding">Code drills</Link></div>
        <div className="card hoverable"><h3>System design drills</h3><p>Whiteboard method + simulator + tradeoff cards.</p><Link className="btn btn-sm" to="/practice/system-design">Design practice</Link></div>
        <div className="card hoverable"><h3>Tradeoff cards ({TRADEOFFS.length})</h3><p>RAG vs fine-tune, workflow vs agent, precision vs recall…</p><Link className="btn btn-sm" to="/practice/tradeoffs">Compare</Link></div>
        <div className="card hoverable"><h3>Answer trainer</h3><p>30s / 60s / 2-min modes · DRET for technical, STAR for behavioral.</p><Link className="btn btn-sm" to="/practice/trainer">Train answers</Link></div>
      </div>
    </div>
  );
}

// ---------- Quiz ----------
export function QuizPage() {
  const [params] = useSearchParams();
  const initialCat = params.get('cat') ?? 'All';
  const [cat, setCat] = useState(initialCat);
  const [diff, setDiff] = useState('All');
  const [count, setCount] = useState(5);
  const [started, setStarted] = useState(false);
  const [seed, setSeed] = useState(1);
  const { progress, dispatch, awardXp } = useApp();
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const pool = useMemo(() => {
    let p = [...QUESTIONS];
    if (cat !== 'All') p = p.filter((q) => q.category === cat);
    if (diff !== 'All') p = p.filter((q) => q.difficulty === diff);
    // deterministic shuffle by seed
    const arr = [...p];
    let s = seed * 9301 + 49297;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr.slice(0, count);
  }, [cat, diff, count, seed]);

  const result = submitted ? scoreQuiz(answers, pool) : null;

  const submit = () => {
    if (!result) return;
    const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0;
    const xp = result.correct * 10 + (pct >= 70 ? 20 : 0);
    dispatch({ type: 'ADD_QUIZ', result: { id: `qr-${Date.now()}`, date: new Date().toISOString(), category: cat === 'All' ? pool[0]?.category ?? 'Mixed' : cat, total: result.total, correct: result.correct, xpEarned: xp, questionIds: pool.map((q) => q.id), misses: result.misses } });
    // badge checks
    if (pct >= 70 && !progress.badges.includes('quiz-rookie')) dispatch({ type: 'AWARD_BADGE', id: 'quiz-rookie' });
    if (cat === 'Evaluation' && pct >= 80 && !progress.badges.includes('metric-master')) dispatch({ type: 'AWARD_BADGE', id: 'metric-master' });
    awardXp(0, `${xp} XP banked`);
    setSubmitted(true);
  };

  if (!started) {
    return (
      <div className="card">
        <h1 className="page-title">Quiz engine</h1>
        <p className="page-sub">Practice questions with ideal-answer structure, traps, and follow-ups. Wrong answers always explain why.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <label>Category <select className="select-input" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>Difficulty <select className="select-input" value={diff} onChange={(e) => setDiff(e.target.value)} aria-label="Difficulty">{['All', 'Foundations', 'Intermediate', 'Advanced'].map((d) => <option key={d}>{d}</option>)}</select></label>
          <label>Count <select className="select-input" value={count} onChange={(e) => setCount(Number(e.target.value))} aria-label="Count">{[5, 8, 10, 15].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        </div>
        <p className="small muted">{pool.length} questions match (of {QUESTIONS.length} total).</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => { setStarted(true); setSubmitted(false); setAnswers({}); }}>Start quiz</button>
          <button className="btn" onClick={() => setSeed((s) => s + 1)}><Shuffle size={14} /> Shuffle</button>
        </div>
      </div>
    );
  }

  if (pool.length === 0) return <Empty title="No questions match" body="Loosen the filters." action={<button className="btn" onClick={() => setStarted(false)}>Back</button>} />;

  return (
    <div>
      <h1 className="page-title">Quiz: {cat} ({pool.length})</h1>
      <p className="page-sub">Practice questions — not real employer questions. Select, submit, and read every explanation.</p>
      {pool.map((q, i) => (
        <div key={q.id} className="card" style={{ marginBottom: 12 }}>
          <p><Chip>{i + 1}/{pool.length}</Chip> <Chip kind="info">{q.category}</Chip> <Chip>{q.difficulty}</Chip> <Chip kind="accent">{q.xp} XP</Chip> <Chip>{q.type}</Chip></p>
          <p><strong>{q.question}</strong></p>
          <QuizInput q={q} value={answers[q.id]} disabled={submitted} onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
          {submitted && (
            <div className={(Array.isArray(q.correctAnswer) ? JSON.stringify([...(answers[q.id] as number[] ?? [])].sort()) === JSON.stringify([...q.correctAnswer].sort()) : answers[q.id] === q.correctAnswer) ? 'alert success' : 'alert error'} style={{ marginTop: 8 }}>
              <p className="small" style={{ margin: 0 }}>{(Array.isArray(q.correctAnswer) ? JSON.stringify([...(answers[q.id] as number[] ?? [])].sort()) === JSON.stringify([...q.correctAnswer].sort()) : answers[q.id] === q.correctAnswer) ? 'Correct. ' : `Incorrect because — ${q.explanation} `}{q.trap && <>Trap: {q.trap}. </>}{q.followUps?.length ? <>Follow-ups: {q.followUps.join(' · ')}</> : null}</p>
              {!((Array.isArray(q.correctAnswer) ? JSON.stringify([...(answers[q.id] as number[] ?? [])].sort()) === JSON.stringify([...q.correctAnswer].sort()) : answers[q.id] === q.correctAnswer)) && <p className="small" style={{ margin: '4px 0 0' }}>Remember: {q.explanation}</p>}
            </div>
          )}
        </div>
      ))}
      {!submitted ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={submit} disabled={Object.keys(answers).length < pool.length}>Submit ({Object.keys(answers).length}/{pool.length})</button>
          <button className="btn" onClick={() => setStarted(false)}>Change setup</button>
        </div>
      ) : (
        <div className="card">
          <h3>Result: {result!.correct}/{result!.total} ({Math.round((result!.correct / Math.max(1, result!.total)) * 100)}%)</h3>
          <p className="small">Saved to Progress → mastery + XP. Misses feed your recommendations.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { setSeed((s) => s + 1); setAnswers({}); setSubmitted(false); }}>Retry new set</button>
            <button className="btn" onClick={() => setStarted(false)}>New setup</button>
            <Link className="btn" to="/progress">View mastery</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function QuizInput({ q, value, disabled, onChange }: { q: (typeof QUESTIONS)[number]; value: number | number[] | undefined; disabled: boolean; onChange: (v: number | number[]) => void }) {
  if (q.type === 'multi') {
    const arr = (value as number[] | undefined) ?? [];
    return (
      <div className="grid" role="group" aria-label="Select all that apply">
        {q.options.map((o, i) => (
          <label key={i} className="quiz-opt">
            <input type="checkbox" disabled={disabled} checked={arr.includes(i)} onChange={() => onChange(arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i])} /> {o}
          </label>
        ))}
      </div>
    );
  }
  return (
    <div className="grid" role="radiogroup" aria-label="Answer options">
      {q.options.map((o, i) => (
        <button key={i} role="radio" aria-checked={value === i} disabled={disabled} className={`quiz-opt${disabled && i === q.correctAnswer ? ' correct' : ''}${disabled && value === i && value !== q.correctAnswer ? ' wrong' : ''}${!disabled && value === i ? ' correct' : ''}`} onClick={() => onChange(i)}>{o}</button>
      ))}
    </div>
  );
}

// ---------- Flashcards ----------
export function FlashcardsPage() {
  const { progress, dispatch } = useApp();
  const [cat, setCat] = useState('All');
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const cats = ['All', ...Array.from(new Set(FLASHCARDS.map((f) => f.category)))];
  const deck = FLASHCARDS.filter((f) => cat === 'All' || f.category === cat);
  const dueFirst = [...deck].sort((a, b) => {
    const da = progress.flashcards[a.id]?.due ?? '0000';
    const db = progress.flashcards[b.id]?.due ?? '0000';
    return (da <= today ? 0 : 1) - (db <= today ? 0 : 1);
  });
  const card = dueFirst[idx % Math.max(1, dueFirst.length)];
  const rate = (r: number) => {
    if (!card) return;
    dispatch({ type: 'UPDATE_CARD', cardId: card.id, rating: r });
    setFlipped(false);
    setIdx((i) => i + 1);
  };
  if (!card) return <Empty title="No cards" body="Try another category." />;
  const meta = progress.flashcards[card.id];
  return (
    <div>
      <h1 className="page-title">Flashcards</h1>
      <p className="page-sub">{FLASHCARDS.length} cards · flip, then grade Again/Hard/Good/Easy. Scheduling persists.</p>
      <label>Category <select className="select-input" value={cat} onChange={(e) => { setCat(e.target.value); setIdx(0); setFlipped(false); }} aria-label="Flashcard category" style={{ maxWidth: 240 }}>{cats.map((c) => <option key={c}>{c}</option>)}</select></label>
      <div className={`flashcard${flipped ? ' flipped' : ''}`} onClick={() => setFlipped(!flipped)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped(!flipped); } }} tabIndex={0} role="button" aria-label={flipped ? 'Show front' : 'Show back'} style={{ marginTop: 12 }}>
        <div className="flashcard-inner">
          <div className="card flash-face" style={{ minHeight: 220 }}>
            <p><Chip kind="info">{card.category}</Chip> <Chip>{card.tag}</Chip> {meta && <Chip kind="accent">interval {meta.interval}d · due {meta.due}</Chip>}</p>
            <h2>{card.front}</h2>
            <p className="caption muted">Click / Enter to flip · Card {(idx % dueFirst.length) + 1}/{dueFirst.length}</p>
          </div>
          <div className="card flash-face flash-back" style={{ minHeight: 220 }}>
            <p><Chip kind="success">Answer</Chip></p>
            <p>{card.back}</p>
            <p className="caption muted">Click to flip back</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-sm" onClick={() => rate(0)}>Again</button>
        <button className="btn btn-sm" onClick={() => rate(1)}>Hard</button>
        <button className="btn btn-primary btn-sm" onClick={() => rate(2)}>Good</button>
        <button className="btn btn-sm" onClick={() => rate(3)}>Easy</button>
        <button className="btn btn-sm btn-ghost" onClick={() => { setIdx((i) => i + 1); setFlipped(false); }}>Skip</button>
      </div>
    </div>
  );
}

// ---------- Scenarios ----------
export function ScenariosPage() {
  const [open, setOpen] = useState<string | null>(null);
  const s = SCENARIOS.find((x) => x.id === open);
  return (
    <div>
      <h1 className="page-title">Scenario library</h1>
      <p className="page-sub">{SCENARIOS.length} practice scenarios — each with constraints, eval, failure cases, and a worked direction. All labeled practice.</p>
      <div className="grid grid-2">
        {SCENARIOS.map((x) => (
          <div key={x.id} className="card hoverable">
            <p><Chip kind="info">{x.domain}</Chip> <Chip>{x.difficulty}</Chip></p>
            <h3>{x.title}</h3>
            <p className="small">{x.problem}</p>
            <button className="btn btn-sm" onClick={() => setOpen(x.id)}>Open brief</button>
          </div>
        ))}
      </div>
      {s && (
        <div className="card" style={{ marginTop: 16 }} role="dialog" aria-label={s.title}>
          <h2>{s.title}</h2>
          <p><strong>Problem:</strong> {s.problem}</p>
          <p><strong>Task:</strong> {s.task}</p>
          <h3>Constraints</h3><ul>{s.constraints.map((c, i) => <li key={i} className="small">{c}</li>)}</ul>
          <h3>Data & APIs</h3><p className="small">{s.data}</p><p className="small"><code>{s.apis}</code></p>
          <h3>Requirements</h3><ul>{s.requirements.map((c, i) => <li key={i} className="small">{c}</li>)}</ul>
          <h3>Architecture choices</h3><ul>{s.architectureChoices.map((c, i) => <li key={i} className="small"><strong>{c.name}:</strong> {c.when} · Risk: {c.risks}</li>)}</ul>
          <h3>Eval & failure cases</h3><ul>{s.eval.map((c, i) => <li key={i} className="small">{c}</li>)}</ul><ul>{s.failureCases.map((c, i) => <li key={i} className="small">{c}</li>)}</ul>
          <div className="alert info"><strong>Worked direction:</strong> {s.solution}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}><button className="btn btn-sm" onClick={() => setOpen(null)}>Close</button><Link className="btn btn-sm btn-primary" to="/practice/labs/system-design">Rehearse in simulator</Link></div>
        </div>
      )}
    </div>
  );
}

// ---------- Coding ----------
const CODING = [
  { id: 'c1', title: 'Timeout + retry wrapper', prompt: 'Wrap requests.post with a 8s timeout, 2 retries with backoff, and a safe fallback. What is missing in: requests.post(url, json=p)?', answer: 'timeout', explanation: 'No timeout means a hung socket blocks forever. Add timeout=8, retries with backoff+jitter, catch RequestException, return/log a redacted fallback.' },
  { id: 'c2', title: 'Parse model JSON safely', prompt: 'Model returns a string. Which two steps make parsing robust?', answer: 'validate', explanation: 'json.loads + schema validation (Pydantic), one retry on failure, human fallback. Never eval() model output.' },
  { id: 'c3', title: 'Parallelize 20 tool calls', prompt: '20 independent GETs take 8s serially. Name the fix + guard.', answer: 'gather', explanation: 'asyncio.gather with a Semaphore (bounded concurrency) + per-call timeouts. Guard with rate limits and retries.' },
  { id: 'c4', title: 'Redact secrets from logs', prompt: 'Logs contain "Authorization: Bearer sk-abc123". What do you change?', answer: 'redact', explanation: 'Structured logging with a redactor for keys/tokens/PII; assert no secret regex hits in tests.' },
];

export function CodingPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const { awardXp } = useApp();
  return (
    <div>
      <h1 className="page-title">Coding reasoning drills</h1>
      <p className="page-sub">Short applied checks — type the key idea (one keyword is enough), then read the reasoning.</p>
      {CODING.map((c) => (
        <div key={c.id} className="card" style={{ marginBottom: 12 }}>
          <h3><Code2 size={15} /> {c.title}</h3>
          <p className="small">{c.prompt}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="text-input" placeholder="Your answer…" aria-label={c.title} value={answers[c.id] ?? ''} onChange={(e) => setAnswers({ ...answers, [c.id]: e.target.value })} style={{ maxWidth: 360 }} />
            <button className="btn btn-sm btn-primary" onClick={() => { setChecked({ ...checked, [c.id]: true }); if ((answers[c.id] ?? '').toLowerCase().includes(c.answer)) awardXp(10, 'code drill'); }}>Check</button>
          </div>
          {checked[c.id] && (
            <div className={(answers[c.id] ?? '').toLowerCase().includes(c.answer) ? 'alert success' : 'alert error'} style={{ marginTop: 8 }}>
              {(answers[c.id] ?? '').toLowerCase().includes(c.answer) ? 'Correct. ' : 'Not quite — '} {c.explanation}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function SystemDesignPracticePage() {
  return (
    <div>
      <h1 className="page-title">System design practice</h1>
      <p className="page-sub">Method first, boxes second. Practice scenario prompts — not real employer prompts.</p>
      <div className="card"><h3><Network size={15} /> The 60-minute method</h3><ol className="small"><li>Clarify users, scale, latency, privacy, success metric (5 min)</li><li>Happy path + data model (10 min)</li><li>Deep dive: retrieval, tools, eval (20 min)</li><li>Scale + failures + security (15 min)</li><li>Tradeoffs + roadmap (10 min)</li></ol>
        <div style={{ display: 'flex', gap: 8 }}><Link className="btn btn-primary btn-sm" to="/practice/labs/system-design">Open simulator</Link><Link className="btn btn-sm" to="/learn/ai-system-design">Read lesson</Link></div></div>
    </div>
  );
}

export function TradeoffsPage() {
  const [open, setOpen] = useState<string | null>(TRADEOFFS[0].id);
  return (
    <div>
      <h1 className="page-title">Tradeoff cards</h1>
      <p className="page-sub">Option A/B with when-each-wins, cost, complexity, reliability. The interview signal is judgment, not trivia.</p>
      <div className="grid grid-2">
        {TRADEOFFS.map((t) => (
          <div key={t.id} className="card">
            <h3><Scale size={15} /> {t.title}</h3>
            <p className="small"><strong>A:</strong> {t.a} · <strong>B:</strong> {t.b}</p>
            {open === t.id ? (
              <div className="small">
                <p><strong>A wins:</strong> {t.aWins}</p><p><strong>B wins:</strong> {t.bWins}</p>
                <p><strong>Cost:</strong> {t.cost}</p><p><strong>Complexity:</strong> {t.complexity}</p><p><strong>Reliability:</strong> {t.reliability}</p>
                <p><strong>Example:</strong> {t.example}</p>
                <button className="btn btn-sm" onClick={() => setOpen(null)}>Collapse</button>
              </div>
            ) : <button className="btn btn-sm" onClick={() => setOpen(t.id)}>Compare</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

const TRAINER_PROMPTS = [
  { cat: 'Technical', q: 'Explain hybrid search and when you would add a reranker. (practice)', frame: 'DRET: Definition → Reason → Example → Tradeoff.' },
  { cat: 'Technical', q: 'Your RAG cites wrong sections though the doc exists. Debug it live. (practice)', frame: 'Trace: ingest → chunks → scores → prompt → answer; name the failure mode.' },
  { cat: 'Behavioral', q: 'Tell me about a time you handled an ambiguous request. (practice)', frame: 'STAR + unknowns → success → MVP → risks.' },
  { cat: 'Technical', q: 'Design refund_order as a tool. (practice)', frame: 'Name, params, auth, idempotency, confirm, errors, eval.' },
  { cat: 'Partner', q: 'Explain RAG vs fine-tuning to a non-technical partner in 30 seconds. (practice)', frame: 'Plain language + numbers + recommendation.' },
];

export function AnswerTrainerPage() {
  const [mode, setMode] = useState(60);
  const [pi, setPi] = useState(0);
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [ratings, setRatings] = useState<Record<string, string>>({});
  React.useEffect(() => {
    if (!running) return;
    if (left <= 0) { setRunning(false); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left]);
  const p = TRAINER_PROMPTS[pi % TRAINER_PROMPTS.length];
  return (
    <div>
      <h1 className="page-title">Answer trainer</h1>
      <p className="page-sub">Timed rehearsal. Speak or write, then self-rate confidence / clarity / depth and compare against the frame.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[30, 60, 120].map((m) => <button key={m} className={`btn btn-sm${mode === m ? ' btn-primary' : ''}`} onClick={() => { setMode(m); setLeft(m); setRunning(false); }}><Timer size={14} /> {m === 120 ? '2 min' : `${m}s`}</button>)}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <p><Chip kind="accent">{p.cat}</Chip></p>
        <h2>{p.q}</h2>
        <p className="small muted">{p.frame}</p>
        <p style={{ fontSize: 34, fontWeight: 800 }} aria-live="polite">{left}s</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => { setLeft(mode); setRunning(true); }}>Start</button>
          <button className="btn btn-sm" onClick={() => setRunning(false)}>Stop</button>
          <button className="btn btn-sm" onClick={() => { setPi((i) => i + 1); setLeft(mode); setRunning(false); }}><RotateCcw size={14} /> Next prompt</button>
        </div>
        {(!running && left === 0) && (
          <div style={{ marginTop: 10 }}>
            <p className="small">Time! Self-rate (1–5), then see the model framing.</p>
            {['confidence', 'clarity', 'depth'].map((k) => (
              <label key={k} className="small" style={{ marginRight: 12 }}>{k} <input type="number" min={1} max={5} value={ratings[`${pi}-${k}`] ?? ''} onChange={(e) => setRatings({ ...ratings, [`${pi}-${k}`]: e.target.value })} style={{ width: 56 }} aria-label={k} /></label>
            ))}
            <div className="alert info" style={{ marginTop: 8 }}>Model framing: open with a one-line definition, give the reason it works, cite one concrete example with a number, close with the tradeoff and an offer to go deeper.</div>
          </div>
        )}
      </div>
      <p className="caption muted" style={{ marginTop: 8 }}><MessagesSquare size={12} /> <Layers size={12} /> Tip: record yourself once — filler words vanish faster than re-reading.</p>
    </div>
  );
}
