import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Timer, Mic, ArrowRight } from 'lucide-react';
import { QUESTIONS } from '../data/questions';
import { useApp } from '../store';
import { Chip, ProgressBar } from '../components/ui';
import { READINESS_WEIGHTS } from '../utils/scoring';

const SECTIONS = [
  { key: 'Intro', title: 'Self-introduction', find: ['q-behav-1'] },
  { key: 'AI Basics', title: 'AI fundamentals', find: ['q-llm-1', 'q-tok-1'] },
  { key: 'RAG', title: 'RAG & retrieval', find: ['q-rag-2', 'q-vec-1'] },
  { key: 'Agents', title: 'Agents & tools', find: ['q-tool-2', 'q-agent-1'] },
  { key: 'Eval', title: 'Evaluation', find: ['q-pr-2', 'q-rageval-1'] },
  { key: 'Python', title: 'Python & APIs', find: ['q-py-1', 'q-api-1'] },
  { key: 'Systems', title: 'Systems & data', find: ['q-db-1', 'q-sys-3'] },
  { key: 'Infra', title: 'Infrastructure & debugging', find: ['q-docker-1', 'q-debug-1'] },
  { key: 'Ambiguous', title: 'Ambiguous problem', find: ['q-amb-1'] },
  { key: 'Partner', title: 'Partner scenario', find: ['q-partner-1'] },
  { key: 'Project', title: 'Project discussion', find: ['q-proj-2'] },
  { key: 'Design', title: 'Design challenge', find: ['q-sys-1'] },
];

function modelAnswerFor(qid: string): string {
  const q = QUESTIONS.find((x) => x.id === qid);
  if (!q) return 'Structure: definition → reason → example with a number → tradeoff → offer to go deeper.';
  const correct = Array.isArray(q.correctAnswer) ? q.options[q.correctAnswer[0]] : q.options[q.correctAnswer as number];
  return `Model framing (practice): ${correct}. ${q.explanation}${q.trap ? ` Watch out — ${q.trap}` : ''}${q.followUps?.length ? ` Be ready for: ${q.followUps[0]}` : ''}`;
}

export function InterviewSimulator() {
  const { progress, dispatch, awardXp } = useApp();
  const [started, setStarted] = useState(false);
  const [si, setSi] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ratings, setRatings] = useState<Record<string, { c: number; l: number; d: number }>>({});
  const [secs, setSecs] = useState(180);
  const [finished, setFinished] = useState(false);

  const qs = useMemo(() => SECTIONS.map((s) => ({ ...s, q: QUESTIONS.find((x) => x.id === s.find[0])! })).filter((s) => s.q), []);
  const cur = qs[si];

  useEffect(() => {
    if (!started || finished) return;
    if (secs <= 0) { next(); return; }
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, secs, finished, si]);

  const next = () => {
    if (si < qs.length - 1) { setSi(si + 1); setSecs(180); }
    else finish();
  };

  const finish = () => {
    const vals = Object.values(ratings);
    const avg = (k: 'c' | 'l' | 'd') => (vals.length ? vals.reduce((a, r) => a + r[k], 0) / vals.length : 3);
    // Map self-ratings + mastery into 6 competencies (0-100)
    const m = progress.mastery;
    const g = (k: string) => m[k]?.pct ?? 50;
    const breakdown = {
      Knowledge: Math.round(avg('c') * 20 * 0.5 + g('LLMs') * 0.5),
      Architecture: Math.round(avg('d') * 20 * 0.5 + ((g('System Design') + g('RAG')) / 2) * 0.5),
      'AI Reasoning': Math.round(avg('d') * 20 * 0.5 + ((g('Agents') + g('Evaluation')) / 2) * 0.5),
      Engineering: Math.round(g('Engineering') * 0.6 + g('Infra') * 0.4),
      'Problem Solving': Math.round(avg('d') * 20 * 0.5 + ((g('FDE Craft') + g('Data')) / 2) * 0.5),
      Communication: Math.round(((avg('c') + avg('l')) / 2) * 20),
    };
    // Weighted readiness: Knowledge 25, Practical(application→Problem Solving+AI Reasoning avg) 25, AI systems 20, Engineering 15, Communication 15
    const practical = Math.round((breakdown['Problem Solving'] + breakdown['AI Reasoning']) / 2);
    const aiSystems = Math.round((breakdown.Architecture + breakdown['AI Reasoning']) / 2);
    const score = Math.round(breakdown.Knowledge * READINESS_WEIGHTS.Knowledge + practical * READINESS_WEIGHTS.Practical + aiSystems * READINESS_WEIGHTS.AISystems + breakdown.Engineering * READINESS_WEIGHTS.Engineering + breakdown.Communication * READINESS_WEIGHTS.Communication);
    dispatch({ type: 'ADD_INTERVIEW', entry: { id: `iv-${Date.now()}`, date: new Date().toISOString(), score, breakdown } });
    if (!progress.badges.includes('interviewer')) dispatch({ type: 'AWARD_BADGE', id: 'interviewer' });
    awardXp(150, 'mock complete');
    setFinished(true);
  };

  if (!started) {
    return (
      <div className="card">
        <p><Chip kind="accent">Timed · 12 sections · ~35 min</Chip> <Chip kind="info">Practice readiness estimate — not a hiring prediction</Chip></p>
        <h1 className="page-title">Final interview simulator</h1>
        <p className="page-sub">Intro → AI fundamentals → RAG → agents → eval → Python → systems → infra → ambiguous → partner → project → design challenge. Questions are drawn from the practice bank. Each answer: write/speak, self-rate confidence/clarity/depth, then compare with a model framing.</p>
        <p className="small">Scoring weights shown at the end: Knowledge 25% · Practical application 25% · AI systems 20% · Engineering 15% · Communication 15%.</p>
        <p className="small">Previous runs: {progress.interviewHistory.length} {progress.interviewHistory[0] ? `(last: ${progress.interviewHistory[0].score}/100)` : ''}</p>
        <button className="btn btn-primary" onClick={() => { setStarted(true); setSecs(180); }}><Mic size={15} /> Start timed simulation</button>
      </div>
    );
  }

  if (finished) {
    const last = progress.interviewHistory[0];
    return (
      <div>
        <h1 className="page-title">Simulation complete</h1>
        <div className="card">
          <h2>Interview Readiness Score: {last?.score}/100</h2>
          <p className="caption muted"><strong>Practice readiness estimate</strong> from self-ratings blended with stored mastery. Weights: Knowledge 25% · Practical application 25% · AI systems 20% · Engineering 15% · Communication 15%. Reflects rehearsal quality — not a hiring prediction and never a guarantee.</p>
          {last && Object.entries(last.breakdown).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 6 }}><div className="caption" style={{ display: 'flex', justifyContent: 'space-between' }}><span>{k}</span><span>{v}%</span></div><ProgressBar value={v} label={`${k} ${v}`} /></div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => { setStarted(false); setFinished(false); setSi(0); setAnswers({}); setRatings({}); }}>Run again</button>
            <Link className="btn btn-primary" to="/progress">See analytics <ArrowRight size={14} /></Link>
          </div>
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Your answers vs model framings</h3>
          {qs.map((s) => (
            <div key={s.key} style={{ marginBottom: 10 }}>
              <p className="small"><strong>{s.title}:</strong> {s.q.question}</p>
              <p className="small muted">You: {(answers[s.q.id] ?? '(skipped)').slice(0, 220)}</p>
              <p className="small">{modelAnswerFor(s.q.id)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const r = ratings[cur.q.id] ?? { c: 3, l: 3, d: 3 };
  const mm = Math.floor(secs / 60); const ss = String(secs % 60).padStart(2, '0');
  return (
    <div className="two-col">
      <div className="card">
        <p><Chip kind="accent">Section {si + 1}/{qs.length}: {cur.title}</Chip></p>
        <h2>{cur.q.question}</h2>
        <p className="caption muted">Practice question · {cur.q.category} · {cur.q.difficulty}</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {cur.q.options.map((o, i) => <span key={i} className="chip">{o.slice(0, 42)}</span>)}
        </div>
        <label>Your answer (write or speak aloud, then summarize here)<textarea className="text-input" rows={5} value={answers[cur.q.id] ?? ''} onChange={(e) => setAnswers({ ...answers, [cur.q.id]: e.target.value })} aria-label="Your answer" placeholder="Frame: definition → reason → example → tradeoff…" /></label>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          {(['c', 'l', 'd'] as const).map((k) => (
            <label key={k} className="small">{k === 'c' ? 'Confidence' : k === 'l' ? 'Clarity' : 'Depth'} <input type="number" min={1} max={5} value={r[k]} onChange={(e) => setRatings({ ...ratings, [cur.q.id]: { ...r, [k]: Number(e.target.value) } })} style={{ width: 56 }} aria-label={k} /></label>
          ))}
        </div>
        <div className="alert info" style={{ marginTop: 10 }}><strong>Model framing:</strong> {modelAnswerFor(cur.q.id)}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className="btn btn-primary" onClick={next} disabled={!(answers[cur.q.id] ?? '').trim()}>{si === qs.length - 1 ? 'Finish & score' : 'Next section'} <ArrowRight size={14} /></button>
          <button className="btn" onClick={next}>Skip</button>
        </div>
        <ProgressBar value={si + 1} max={qs.length} label="simulation progress" />
      </div>
      <aside className="side-panel">
        <div className="card"><h3><Timer size={14} /> {mm}:{ss} left this section</h3><ProgressBar value={secs} max={180} label="time left" /><p className="caption muted">Total ~35 min. Timer auto-advances — rehearse concision.</p></div>
        <div className="card"><h3>Competencies tracked</h3><p className="small">Knowledge · Architecture · AI Reasoning · Engineering · Problem Solving · Communication</p><p className="caption muted">Final score blends your self-ratings with stored mastery — transparent, inspectable, practice-only.</p></div>
      </aside>
    </div>
  );
}
