import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Upload, Trash2, Moon, Sun, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useApp } from '../store';
import { LESSONS, lessonById } from '../data/lessons';
import { ACHIEVEMENTS } from '../data/extras';
import { levelForXp } from '../types';
import { Chip, ProgressBar, Empty } from '../components/ui';
import { StreakCal } from './core';
import { storageService } from '../utils/storage';

// ---------- Projects ----------
const FIELDS = [
  ['name', 'Project name'],
  ['problem', 'Problem (who hurt, how much)'],
  ['users', 'Users & scale'],
  ['arch', 'Architecture (boxes + data flow)'],
  ['tech', 'Tech stack'],
  ['role', 'Your role (precise scope)'],
  ['hardest', 'Hardest problem YOU solved'],
  ['decision', 'Key decision + tradeoff (options → choice → why)'],
  ['failure', 'A failure + fix'],
  ['result', 'Result (numbers if real, else qualitative — never invent)'],
  ['future', 'What you would improve next'],
] as const;

const SEEDS = ['Intelligent Mob Surveillance System', 'SkillNexus', 'CampusCollab/TaskNest', 'Stock Market Data Simulation Platform'];

export function ProjectsPage() {
  const { progress, dispatch, awardXp } = useApp();
  const [form, setForm] = useState<Record<string, string>>({ name: SEEDS[0] });
  const story = progress.projectStories[form.name || 'untitled'];
  const generate = () => {
    const f = form;
    const text = `# ${f.name || 'Untitled project'}\n\n1. PROBLEM — ${f.problem || '[fill in real problem]'}\n   Users: ${f.users || '[who, how many]'}\n\n2. ARCHITECTURE — ${f.arch || '[boxes + data flow]'}\n   Stack: ${f.tech || '[stack]'}\n   My role: ${f.role || '[your precise scope; credit teammates]'}\n\n3. DECISIONS — ${f.decision || '[option A vs B → choice → why]'}\n\n4. CHALLENGE — ${f.hardest || '[hardest problem]'} → Failure: ${f.failure || '[what broke + fix]'}\n\n5. RESULT — ${f.result || '[real numbers only — leave blank rather than invent]'}\n\n6. LESSONS — ${f.future || '[what you would change]'}\n\nDelivery: 3–4 min spoken, then invite questions. Built ONLY from details you entered — nothing invented.`;
    dispatch({ type: 'SAVE_STORY', key: form.name || 'untitled', text });
    awardXp(40, 'story built');
  };
  return (
    <div>
      <h1 className="page-title">Project Story Builder</h1>
      <p className="page-sub">Generates a Problem→Architecture→Decisions→Challenge→Solution→Result→Lessons presentation <strong>only from details you provide</strong>. It never invents metrics or architecture.</p>
      <p className="small">Seed names (details stay empty until you write them): {SEEDS.map((s) => <button key={s} className="btn btn-sm" style={{ margin: 2 }} onClick={() => setForm({ ...form, name: s })}>{s}</button>)}</p>
      <div className="grid grid-2">
        <div className="card">
          {FIELDS.map(([k, label]) => (
            <label key={k} className="small" style={{ display: 'block', marginBottom: 8 }}>{label}<textarea className="text-input" rows={k === 'name' ? 1 : 2} value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} aria-label={label} /></label>
          ))}
          <button className="btn btn-primary" onClick={generate}>Generate presentation</button>
        </div>
        <div className="card">
          <h3>Preview</h3>
          {story ? <pre style={{ whiteSpace: 'pre-wrap' }}>{story}</pre> : <p className="caption muted">Fill the form and generate — saved per project name, survives refresh.</p>}
          {Object.keys(progress.projectStories).length > 0 && <div><h3>Saved stories</h3>{Object.keys(progress.projectStories).map((k) => <p key={k} className="small">• {k} <button className="btn btn-sm" onClick={() => setForm({ name: k })}>Load</button></p>)}</div>}
        </div>
      </div>
    </div>
  );
}

// ---------- Progress ----------
export function ProgressPage() {
  const { progress } = useApp();
  const masteryData = useMemo(() => Object.entries(progress.mastery).map(([k, v]) => ({ topic: k, pct: v.pct, seen: v.seen })), [progress]);
  const xpTrend = useMemo(() => {
    const pts = [{ n: 'start', xp: 0 }];
    [...progress.quizResults].reverse().forEach((r, i) => pts.push({ n: `q${i + 1}`, xp: r.xpEarned }));
    let run = 0;
    return pts.map((p) => { run += p.xp; return { n: p.n, xp: run }; });
  }, [progress]);
  const { current } = levelForXp(progress.xp);
  return (
    <div>
      <h1 className="page-title">Progress & analytics</h1>
      <p className="page-sub">Level {current.level} · {current.name} · {progress.xp} XP · {progress.completedLessons.length}/{LESSONS.length} lessons · streak {progress.streak}d. Screen-reader summaries accompany every chart.</p>
      <div className="grid grid-2">
        <div className="card"><h3>Mastery by topic (from stored quiz/lesson performance)</h3>
          {masteryData.length === 0 ? <p className="caption muted">No data yet — take a quiz.</p> :
            <><ResponsiveContainer width="100%" height={240}><BarChart data={masteryData} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" domain={[0, 100]} /><YAxis type="category" dataKey="topic" width={110} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="pct" fill="#2563eb" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer>
              <p className="sr-only">Mastery: {masteryData.map((d) => `${d.topic} ${d.pct} percent over ${d.seen} attempts`).join('; ')}</p></>}
        </div>
        <div className="card"><h3>XP accumulation</h3>
          <ResponsiveContainer width="100%" height={240}><LineChart data={xpTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="n" /><YAxis /><Tooltip /><Line type="monotone" dataKey="xp" stroke="#0e7490" strokeWidth={2} /></LineChart></ResponsiveContainer>
          <p className="sr-only">Total {progress.xp} XP across {progress.quizResults.length} quizzes.</p>
          <div style={{ marginTop: 8 }}><StreakCal days={progress.streakDays} /></div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h3>Quiz history</h3>
        {progress.quizResults.length === 0 ? <p className="caption muted">No quizzes yet.</p> :
          <div className="table-wrap"><table><thead><tr><th>Date</th><th>Category</th><th>Score</th><th>XP</th></tr></thead><tbody>
            {progress.quizResults.slice(0, 20).map((r) => <tr key={r.id}><td>{new Date(r.date).toLocaleString()}</td><td>{r.category}</td><td>{r.correct}/{r.total}</td><td>+{r.xpEarned}</td></tr>)}
          </tbody></table></div>}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h3>Interview history (practice readiness estimates)</h3>
        {progress.interviewHistory.length === 0 ? <p className="caption muted">No simulations yet. <Link to="/interview/simulator">Run one</Link>.</p> :
          progress.interviewHistory.map((h) => <p key={h.id} className="small">{new Date(h.date).toLocaleString()} — <strong>{h.score}/100</strong> · {Object.entries(h.breakdown).map(([k, v]) => `${k} ${v}`).join(' · ')}</p>)}
      </div>
    </div>
  );
}

// ---------- Achievements ----------
export function AchievementsPage() {
  const { progress, dispatch } = useApp();
  // live checks for lesson/xp/streak badges
  React.useEffect(() => {
    const give = (id: string) => { if (!progress.badges.includes(id)) dispatch({ type: 'AWARD_BADGE', id }); };
    if (progress.completedLessons.length >= 1) give('first-steps');
    if (progress.completedLessons.length >= 15) give('scholar');
    if (progress.xp >= 1500) give('marathon');
    if (progress.streak >= 3) give('streak-3');
    if (progress.streak >= 7) give('streak-7');
    if (progress.completedLessons.includes('rag') ) give('rag-explorer');
    if (progress.completedLessons.includes('tool-calling') && progress.completedLessons.includes('workflows-vs-agents')) give('agent-tamer');
    if (progress.completedLessons.includes('ai-system-design')) give('architect');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.completedLessons, progress.xp, progress.streak]);
  return (
    <div>
      <h1 className="page-title">Achievements</h1>
      <p className="page-sub">{progress.badges.length}/{ACHIEVEMENTS.length} earned. Supportive, not distracting.</p>
      <div className="grid grid-3">
        {ACHIEVEMENTS.map((a) => {
          const earned = progress.badges.includes(a.id);
          return (
            <div key={a.id} className="card" style={{ opacity: earned ? 1 : 0.65 }}>
              <h3><Award size={15} /> {a.name} {earned ? '✓' : '🔒'}</h3>
              <p className="small">{a.desc}</p>
              <p><Chip kind={earned ? 'success' : undefined}>{earned ? 'Earned' : 'Locked'}</Chip></p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Review ----------
export function ReviewPage() {
  const { progress } = useApp();
  const [q, setQ] = useState('');
  const bookmarks = progress.bookmarks;
  const allNotes = Object.values(progress.notes).flat();
  const filteredNotes = allNotes.filter((n) => !q || n.text.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <h1 className="page-title">Review</h1>
      <p className="page-sub">Bookmarks + notes, searchable. Everything persists in localStorage via one storage service.</p>
      <div className="grid grid-2">
        <div className="card"><h3>Bookmarks ({bookmarks.length})</h3>
          {bookmarks.length === 0 ? <p className="caption muted">Bookmark any lesson to find it here.</p> :
            bookmarks.map((b) => {
              const lid = b.replace('lesson:', '');
              const l = lessonById(lid);
              return <p key={b} className="small">🔖 <Link to={`/learn/${lid}`}>{l?.title ?? lid}</Link></p>;
            })}
        </div>
        <div className="card"><h3>Notes ({allNotes.length})</h3>
          <input className="text-input" placeholder="Search notes…" aria-label="Search all notes" value={q} onChange={(e) => setQ(e.target.value)} />
          <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
            {filteredNotes.map((n) => { const l = lessonById(n.lessonId); return <div key={n.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}><p className="small" style={{ margin: 0 }}>{n.text}</p><p className="caption muted"><Link to={`/learn/${n.lessonId}`}>{l?.title ?? n.lessonId}</Link> · {new Date(n.updated).toLocaleString()}</p></div>; })}
            {filteredNotes.length === 0 && <p className="caption muted">No notes match.</p>}
          </div>
        </div>
      </div>
      {progress.quizResults.some((r) => r.misses.length) && (
        <div className="card" style={{ marginTop: 12 }}><h3>Retry your misses</h3><p className="small">You missed {progress.quizResults.reduce((a, r) => a + r.misses.length, 0)} questions overall. <Link to="/practice/quiz">Start a quiz</Link> to repair them — recommendations on the dashboard point at the exact lessons.</p></div>
      )}
    </div>
  );
}

// ---------- Settings ----------
export function SettingsPage() {
  const { progress, dispatch } = useApp();
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') ?? 'light');
  const setT = (t: string) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('fde-theme', t); setTheme(t); };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'fde-lab-progress.json'; a.click();
  };
  const importData = (f: File) => {
    const r = new FileReader();
    r.onload = () => { try { const v = JSON.parse(String(r.result)); dispatch({ type: 'HYDRATE', value: v }); } catch { alert('Invalid file'); } };
    r.readAsText(f);
  };
  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <div className="grid grid-2">
        <div className="card"><h3>Appearance</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`btn btn-sm${theme !== 'dark' ? ' btn-primary' : ''}`} onClick={() => setT('light')}><Sun size={14} /> Light</button>
            <button className={`btn btn-sm${theme === 'dark' ? ' btn-primary' : ''}`} onClick={() => setT('dark')}><Moon size={14} /> Dark</button>
          </div>
          <p className="caption muted">Real dark-theme variants, reduced-motion respected, keyboard navigable, focus visible.</p>
        </div>
        <div className="card"><h3>Data</h3>
          <p className="small">All state lives in one localStorage key (<code>{storageService.progressKey}</code>) via a single storage service. No backend in v1.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-sm" onClick={exportData}><Download size={14} /> Export JSON</button>
            <label className="btn btn-sm"> <Upload size={14} /> Import <input type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); }} /></label>
            <button className="btn btn-sm" onClick={() => { if (confirm('Reset all progress?')) dispatch({ type: 'RESET' }); }}><Trash2 size={14} /> Reset</button>
          </div>
          <div style={{ marginTop: 8 }}><ProgressBar value={progress.completedLessons.length} max={LESSONS.length} label="overall completion" /><p className="caption muted">{progress.completedLessons.length}/{LESSONS.length} lessons · {progress.xp} XP</p></div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h3>About & content honesty</h3>
        {progress.completedLessons.length === 0 && <Empty title="Fresh start" body="Your dashboard diagnostic will build a starting profile." action={<Link className="btn btn-sm btn-primary" to="/dashboard">Open dashboard</Link>} />}
        <p className="small">Labels used throughout: <Chip kind="info">Verified role information</Chip> <Chip kind="info">General industry preparation</Chip> <Chip kind="info">Interview prediction / practice scenario</Chip>. Practice questions are rehearsal only. This app is not official, guarantees nothing, and keeps all data on-device.</p>
      </div>
    </div>
  );
}
