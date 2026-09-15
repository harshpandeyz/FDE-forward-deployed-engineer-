import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Menu, X, LayoutDashboard, BookOpen, Dumbbell, Mic, FolderKanban, ChartLine, Trophy, Bookmark, Settings, House, FlaskConical, GraduationCap } from 'lucide-react';
import { LESSONS } from '../data/lessons';
import { QUESTIONS } from '../data/questions';
import { FLASHCARDS } from '../data/flashcards';
import { SCENARIOS } from '../data/scenarios';
import { useApp } from '../store';

const NAV = [
  { section: 'Main' },
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
  { to: '/interview/simulator', label: 'Interview Sim', icon: Mic },
  { section: 'Build' },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/progress', label: 'Progress', icon: ChartLine },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/review', label: 'Review', icon: Bookmark },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const { progress, xpToast } = useApp();
  const nav = useNavigate();

  const results = q.trim().length > 1 ? searchAll(q.trim()) : [];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Primary navigation">
        <div className="sidebar-brand">
          <div className="brand-mark" aria-hidden="true">◈</div>
          <div>
            <div className="brand-name">FDE AI Interview Lab</div>
            <div className="brand-sub">Role-aligned practice · not official</div>
          </div>
          <button className="btn btn-sm btn-ghost mobile-menu-btn" style={{ marginLeft: 'auto' }} onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <nav className="side-nav">
          {NAV.map((n: any, i) =>
            n.section ? (
              <div key={i} className="nav-section-label">{n.section}</div>
            ) : (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>
                <n.icon size={17} aria-hidden="true" /> {n.label}
              </NavLink>
            )
          )}
          <div className="nav-section-label">Labs</div>
          <NavLink to="/practice/labs/rag" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}><FlaskConical size={17} /> All 15 labs</NavLink>
          <NavLink to="/learn/final-prep" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}><GraduationCap size={17} /> Final prep</NavLink>
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <div className="small" style={{ fontWeight: 700 }}>{progress.xp} XP · 🔥 {progress.streak}d streak</div>
          <div className="caption muted">{progress.completedLessons.length} lessons · {progress.badges.length} badges</div>
        </div>
      </aside>

      <div className="main-wrap">
        <header className="topbar">
          <button className="btn btn-sm mobile-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={18} /></button>
          <div className="search-wrap">
            <Search size={16} aria-hidden="true" />
            <input
              type="search" placeholder="Search lessons, questions, flashcards, scenarios…" aria-label="Global search"
              value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) { nav(results[0].to); setQ(''); } }}
            />
            {focused && results.length > 0 && (
              <div className="search-results" role="listbox" aria-label="Search results">
                {results.slice(0, 12).map((r) => (
                  <Link key={r.to} to={r.to} onClick={() => setQ('')}>{r.kind}: {r.title}</Link>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <ThemeToggle />
            <Link className="btn btn-primary btn-sm" to="/dashboard">Continue</Link>
          </div>
        </header>
        <main id="main" className="content" tabIndex={-1}>{children}</main>
        <nav className="bottom-nav" aria-label="Mobile navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}><House size={20} />Home</NavLink>
          <NavLink to="/learn" className={({ isActive }) => (isActive ? 'active' : '')}><BookOpen size={20} />Learn</NavLink>
          <NavLink to="/practice" className={({ isActive }) => (isActive ? 'active' : '')}><Dumbbell size={20} />Practice</NavLink>
          <NavLink to="/interview/simulator" className={({ isActive }) => (isActive ? 'active' : '')}><Mic size={20} />Mock</NavLink>
          <NavLink to="/progress" className={({ isActive }) => (isActive ? 'active' : '')}><ChartLine size={20} />Stats</NavLink>
        </nav>
      </div>
      {xpToast && <div className="xp-toast" role="status">{xpToast}</div>}
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 35 }} />}
    </div>
  );
}

function ThemeToggle() {
  const [, force] = useState(0);
  const theme = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : 'light';
  return (
    <button
      className="btn btn-sm"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      onClick={() => {
        const next = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('fde-theme', next);
        force((x) => x + 1);
      }}
    >
      {theme === 'dark' ? '☀ Light' : '◐ Dark'}
    </button>
  );
}

function searchAll(q: string): { kind: string; title: string; to: string }[] {
  const s = q.toLowerCase();
  const out: { kind: string; title: string; to: string }[] = [];
  LESSONS.filter((l) => (l.title + l.summary + l.tags.join(' ')).toLowerCase().includes(s)).slice(0, 5)
    .forEach((l) => out.push({ kind: 'Lesson', title: l.title, to: `/learn/${l.id}` }));
  QUESTIONS.filter((x) => x.question.toLowerCase().includes(s)).slice(0, 4)
    .forEach((x) => out.push({ kind: 'Question', title: x.question.slice(0, 60), to: `/practice/quiz?cat=${encodeURIComponent(x.category)}` }));
  FLASHCARDS.filter((f) => (f.front + f.back).toLowerCase().includes(s)).slice(0, 3)
    .forEach((f) => out.push({ kind: 'Flashcard', title: f.front.slice(0, 60), to: '/practice/flashcards' }));
  SCENARIOS.filter((x) => (x.title + x.problem).toLowerCase().includes(s)).slice(0, 3)
    .forEach((x) => out.push({ kind: 'Scenario', title: x.title, to: '/practice/scenarios' }));
  return out;
}
