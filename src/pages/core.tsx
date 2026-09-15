import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Star, BookOpen, Dumbbell, Mic, Sparkles, CircleCheck, TriangleAlert } from 'lucide-react';
import { useApp, masteryRecommendations } from '../store';
import { LESSONS } from '../data/lessons';
import { QUESTIONS } from '../data/questions';
import { MODULES } from '../data/modules';
import { ACHIEVEMENTS } from '../data/extras';
import { levelForXp } from '../types';
import { Chip, ProgressBar, ReadinessRing } from '../components/ui';
import { readinessFromMastery } from '../utils/scoring';

const DIAG_IDS = ['q-py-1', 'q-llm-1', 'q-rag-1', 'q-tool-1', 'q-pr-1', 'q-api-1', 'q-docker-1', 'q-sys-1', 'q-behav-1', 'q-amb-1'];

export function Home() {
  return (
    <div>
      <p><Chip kind="info">General industry preparation · Practice scenarios labeled throughout</Chip></p>
      <h1 className="page-title">Become the engineer who can discover, build, and ship AI in the real world.</h1>
      <p className="page-sub">
        FDE AI Interview Lab is an interactive practice app for Forward Deployed Engineer / Applied AI interviews:
        10 phases, 25 deep lessons, 15 working labs, 80+ practice questions, and a timed mock interview.
        Everything is <strong>role-aligned practice</strong> — never presented as official or internal process.
      </p>
      <div className="grid grid-3">
        <div className="card hoverable"><h3><BookOpen size={16} /> Learn the systems</h3><p>RAG, agents, eval, infra, system design, partner craft — with diagrams, code, and mini-quizzes.</p><Link className="btn btn-primary btn-sm" to="/learn">Start learning <ArrowRight size={14} /></Link></div>
        <div className="card hoverable"><h3><Dumbbell size={16} /> Practice deliberately</h3><p>Quizzes with real explanations, flashcards with spaced repetition, 15 hands-on labs and games.</p><Link className="btn btn-sm" to="/practice">Open practice <ArrowRight size={14} /></Link></div>
        <div className="card hoverable"><h3><Mic size={16} /> Prove readiness</h3><p>Timed simulator across 11 sections with a transparent practice readiness estimate.</p><Link className="btn btn-sm" to="/interview/simulator">Run mock <ArrowRight size={14} /></Link></div>
      </div>
      <div className="alert info" style={{ marginTop: 16 }}>
        <strong>Content honesty:</strong> lessons are labeled <em>Verified role information</em>, <em>General industry preparation</em>, or <em>Interview prediction / practice scenario</em>.
        Practice questions are exactly that — practice. This app does not guarantee interviews or jobs and is not an official test.
      </div>
      <h2 style={{ marginTop: 26 }}>Curriculum at a glance</h2>
      <div className="grid grid-2">
        {MODULES.map((m) => (
          <div key={m.id} className="card"><h3>{m.index}. {m.title}</h3><p>{m.blurb}</p><p className="caption muted">{m.lessonIds.length} lessons</p></div>
        ))}
      </div>
    </div>
  );
}

const MISSIONS = [
  { id: 'm-rag', title: 'Design a customer-support RAG system', xp: 120, tasks: ['Read the RAG lesson', 'Run the RAG Lab with 3 configs', 'Score 70%+ on a RAG quiz', 'Sketch the architecture in System Design Sim'] },
  { id: 'm-agent', title: 'Tame a tool-calling agent', xp: 120, tasks: ['Read Tool Calling', 'Step through the Agent Lab trace', 'Win the Tool Design game', 'Score 70%+ on an Agents quiz'] },
  { id: 'm-eval', title: 'Own the metrics', xp: 100, tasks: ['Read Precision/Recall/F1', 'Hit the target in the PR game', 'Score 70%+ on an Evaluation quiz'] },
];

function missionForDate(): (typeof MISSIONS)[number] {
  const day = new Date().getDate();
  return MISSIONS[day % MISSIONS.length];
}

export function Dashboard() {
  const { progress, dispatch, awardXp } = useApp();
  const mission = missionForDate();
  const doneCount = mission.tasks.filter((_, i) => progress.missionsCompleted.includes(`${mission.id}-${i}`)).length;
  const allDone = doneCount === mission.tasks.length;
  const { current, next } = levelForXp(progress.xp);
  const readiness = readinessFromMastery(progress.mastery);
  const recs = masteryRecommendations(progress);
  const nextLesson = useMemo(() => {
    const done = new Set(progress.completedLessons);
    if (progress.diagnostic?.gaps?.length) {
      const gapLesson: Record<string, string> = { RAG: 'rag', Agents: 'tool-calling', Evaluation: 'precision-recall-f1', Engineering: 'rest-apis', 'System Design': 'ai-system-design', Data: 'data-quality', LLMs: 'llms', 'FDE Craft': 'ambiguous-problem-solving', Communication: 'project-interviews', Infra: 'docker' };
      for (const g of progress.diagnostic.gaps) {
        const lid = gapLesson[g];
        if (lid && !done.has(lid)) return LESSONS.find((l) => l.id === lid);
      }
    }
    return LESSONS.find((l) => !done.has(l.id)) ?? LESSONS[0];
  }, [progress]);

  if (!progress.onboardingDone) return <Onboarding />;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Level {current.level} · {current.name} — {progress.xp} XP{next ? ` · ${next.minXp - progress.xp} XP to ${next.name}` : ' · max level'}. Streak: {progress.streak} day(s).</p>
      <div className="grid grid-3">
        <div className="card">
          <div className="ring-wrap">
            <ReadinessRing score={readiness.score} />
            <div>
              <strong>Practice readiness estimate</strong>
              <p className="caption muted" style={{ maxWidth: 220 }}>From stored quiz/lesson performance. Weights: Knowledge 25% · Practical 25% · AI systems 20% · Engineering 15% · Communication 15%. Not a hiring prediction.</p>
              <Link className="btn btn-primary btn-sm" to="/interview/simulator">Run mock interview</Link>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gap: 6 }}>
            {Object.entries(readiness.breakdown).map(([k, v]) => (
              <div key={k}><div className="caption" style={{ display: 'flex', justifyContent: 'space-between' }}><span>{k}</span><span>{v}%</span></div><ProgressBar value={v} label={`${k} ${v} percent`} /></div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3><Flame size={16} /> Today's mission</h3>
          <p><strong>{mission.title}</strong> · {mission.xp} XP + streak bonus</p>
          {mission.tasks.map((t, i) => {
            const key = `${mission.id}-${i}`;
            const done = progress.missionsCompleted.includes(key);
            return (
              <label key={key} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, padding: '6px 0' }}>
                <input type="checkbox" checked={done} onChange={() => {
                  if (!done) { dispatch({ type: 'COMPLETE_MISSION', id: key, xp: 15 }); if (doneCount + 1 === mission.tasks.length) awardXp(mission.xp, 'mission complete'); else awardXp(0, '+15 XP · task done'); }
                }} aria-label={t} /> <span style={{ textDecoration: done ? 'line-through' : 'none' }}>{t}</span>
              </label>
            );
          })}
          {allDone && <div className="alert success">Mission complete. Streak bonus applied via daily activity. <CircleCheck size={14} /></div>}
          <div className="divider" />
          <h3><Sparkles size={16} /> Continue learning</h3>
          <p className="small">{nextLesson?.title}</p>
          <Link className="btn btn-primary btn-sm" to={`/learn/${nextLesson?.id}`}>Continue: {nextLesson?.title.slice(0, 28)}… <ArrowRight size={14} /></Link>
        </div>
        <div className="card">
          <h3><TriangleAlert size={16} /> Weak areas & next actions</h3>
          {recs.length === 0 ? <p className="small">No weak signals yet — take a quiz to calibrate.</p> : recs.map((r, i) => <p key={i} className="small">• {r}</p>)}
          <div className="divider" />
          <h3><Star size={16} /> Recent achievements</h3>
          {progress.badges.length === 0 ? <p className="caption muted">No badges yet — complete a lesson to earn First Steps.</p> : progress.badges.slice(-3).map((b) => {
            const a = ACHIEVEMENTS.find((x) => x.id === b);
            return <p key={b} className="small">🏅 {a?.name ?? b}</p>;
          })}
          <Link className="btn btn-sm" to="/achievements">View all</Link>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Streak calendar (last {Math.min(90, progress.streakDays.length + 14)} days)</h3>
        <StreakCal days={progress.streakDays} />
      </div>
    </div>
  );
}

export function StreakCal({ days }: { days: string[] }) {
  const set = new Set(days);
  const cells: string[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    cells.push(d);
  }
  return (
    <div>
      <div className="streak-cal" role="img" aria-label={`${days.length} active days in history`}>
        {cells.map((d) => <div key={d} className={`streak-cell${set.has(d) ? ' on' : ''}`} title={d} />)}
      </div>
      <p className="caption muted">Color + position encode activity (never color alone — hover shows the date).</p>
    </div>
  );
}

function Onboarding() {
  const { dispatch, awardXp } = useApp();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const qs = DIAG_IDS.map((id) => QUESTIONS.find((x) => x.id === id)!).filter(Boolean);
  const q = qs[idx];
  const done = idx >= qs.length;

  if (done) {
    const misses: Record<string, number> = {};
    qs.forEach((x) => { if (answers[x.id] !== x.correctAnswer) misses[x.category] = (misses[x.category] ?? 0) + 1; });
    const gaps = Object.entries(misses).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    const strengths = [...new Set(qs.filter((x) => answers[x.id] === x.correctAnswer).map((x) => x.category))].slice(0, 3);
    return (
      <div className="card">
        <h2>Your starting profile</h2>
        <p><Chip kind="success">Strengths: {strengths.join(', ') || '—'}</Chip> <Chip kind="warning">Gaps: {gaps.join(', ') || '—'}</Chip></p>
        <p className="small">Diagnostic complete — this is <em>general preparation signal</em>, not a hiring prediction. We will route you to your biggest gap first.</p>
        <button className="btn btn-primary" onClick={() => { dispatch({ type: 'SET_ONBOARDING', diagnostic: { strengths, gaps } }); awardXp(50, 'diagnostic done'); }}>Start my path</button>
      </div>
    );
  }

  return (
    <div className="card">
      <p><Chip kind="accent">First-run diagnostic · {idx + 1}/{qs.length}</Chip></p>
      <h2>{q.question}</h2>
      <p className="caption muted">Category: {q.category} · practice question</p>
      <div className="grid" style={{ marginTop: 12 }}>
        {q.options.map((o, i) => (
          <button key={i} className="quiz-opt" onClick={() => { setAnswers({ ...answers, [q.id]: i }); setIdx(idx + 1); }}>{o}</button>
        ))}
      </div>
      <ProgressBar value={idx} max={qs.length} label="diagnostic progress" />
    </div>
  );
}

export function NotFound() {
  return (
    <div className="card">
      <h1 className="page-title">404 — Nothing here</h1>
      <p className="page-sub">That route does not exist. Try the dashboard, learn path, or practice hub.</p>
      <div style={{ display: 'flex', gap: 8 }}><Link className="btn btn-primary" to="/">Home</Link><Link className="btn" to="/learn">Learn</Link><Link className="btn" to="/practice">Practice</Link></div>
    </div>
  );
}
