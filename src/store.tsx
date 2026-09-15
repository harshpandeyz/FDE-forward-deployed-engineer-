import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { QuizResult, UserProgress } from './types';
import { storageService } from './utils/storage';

const todayKey = () => new Date().toISOString().slice(0, 10);

function initialProgress(): UserProgress {
  return {
    completedLessons: [],
    quizResults: [],
    mastery: {},
    xp: 0,
    streak: 0,
    lastActiveDate: '',
    streakDays: [],
    badges: [],
    bookmarks: [],
    notes: {},
    flashcards: {},
    interviewHistory: [],
    missionsCompleted: [],
    onboardingDone: false,
    diagnostic: null,
    projectStories: {},
  };
}

type Action =
  | { type: 'HYDRATE'; value: UserProgress }
  | { type: 'COMPLETE_LESSON'; id: string; xp: number }
  | { type: 'ADD_QUIZ'; result: QuizResult }
  | { type: 'TOGGLE_BOOKMARK'; id: string }
  | { type: 'ADD_NOTE'; lessonId: string; text: string }
  | { type: 'EDIT_NOTE'; lessonId: string; noteId: string; text: string }
  | { type: 'DELETE_NOTE'; lessonId: string; noteId: string }
  | { type: 'UPDATE_CARD'; cardId: string; rating: number }
  | { type: 'ADD_INTERVIEW'; entry: UserProgress['interviewHistory'][number] }
  | { type: 'COMPLETE_MISSION'; id: string; xp: number }
  | { type: 'ADD_XP'; xp: number }
  | { type: 'AWARD_BADGE'; id: string }
  | { type: 'SET_ONBOARDING'; diagnostic: { strengths: string[]; gaps: string[] } }
  | { type: 'SAVE_STORY'; key: string; text: string }
  | { type: 'RESET' };

function skillToMastery(skill: string): string {
  const m: Record<string, string> = {
    LLMs: 'LLMs', RAG: 'RAG', Agents: 'Agents', Evaluation: 'Evaluation',
    Data: 'Data', Engineering: 'Engineering', Infra: 'Infra',
    'System Design': 'System Design', 'FDE Craft': 'FDE Craft', Communication: 'Communication',
    Python: 'Engineering', APIs: 'Engineering', Databases: 'Engineering',
    Docker: 'Infra', Debugging: 'Engineering', Partner: 'FDE Craft',
    Behavioral: 'Communication', Projects: 'Communication',
  };
  return m[skill] ?? skill;
}

function reducer(state: UserProgress, action: Action): UserProgress {
  switch (action.type) {
    case 'HYDRATE': return { ...state, ...action.value };
    case 'COMPLETE_LESSON': {
      if (state.completedLessons.includes(action.id)) return state;
      return { ...state, completedLessons: [...state.completedLessons, action.id], xp: state.xp + action.xp };
    }
    case 'ADD_QUIZ': {
      const mastery = { ...state.mastery };
      // misses carry "skill::qid" — parse skill from question lookup done by caller; here result.misses are qids and we store per-category via result.category buckets
      const r = action.result;
      const key = skillToMastery(r.category);
      const prev = mastery[key] ?? { seen: 0, correct: 0, pct: 0 };
      const seen = prev.seen + r.total;
      const correct = prev.correct + r.correct;
      mastery[key] = { seen, correct, pct: seen ? Math.round((correct / seen) * 100) : 0 };
      return { ...state, quizResults: [r, ...state.quizResults].slice(0, 100), mastery, xp: state.xp + r.xpEarned };
    }
    case 'TOGGLE_BOOKMARK': {
      const has = state.bookmarks.includes(action.id);
      return { ...state, bookmarks: has ? state.bookmarks.filter((b) => b !== action.id) : [...state.bookmarks, action.id] };
    }
    case 'ADD_NOTE': {
      const list = state.notes[action.lessonId] ?? [];
      const note = { id: `n-${Date.now()}`, lessonId: action.lessonId, text: action.text, updated: new Date().toISOString() };
      return { ...state, notes: { ...state.notes, [action.lessonId]: [...list, note] } };
    }
    case 'EDIT_NOTE': {
      const list = (state.notes[action.lessonId] ?? []).map((n) => (n.id === action.noteId ? { ...n, text: action.text, updated: new Date().toISOString() } : n));
      return { ...state, notes: { ...state.notes, [action.lessonId]: list } };
    }
    case 'DELETE_NOTE': {
      const list = (state.notes[action.lessonId] ?? []).filter((n) => n.id !== action.noteId);
      return { ...state, notes: { ...state.notes, [action.lessonId]: list } };
    }
    case 'UPDATE_CARD': {
      const prev = state.flashcards[action.cardId] ?? { ease: 2.5, interval: 1, due: todayKey(), lapses: 0 };
      // SM-2 lite: Again=0 Hard=1 Good=2 Easy=3
      let { ease, interval } = prev;
      if (action.rating === 0) { ease = Math.max(1.3, ease - 0.2); interval = 1; }
      else if (action.rating === 1) { interval = Math.max(1, Math.round(interval * 1.2)); }
      else if (action.rating === 2) { interval = Math.round(interval * ease); ease = Math.min(3, ease + 0.05); }
      else { interval = Math.round(interval * ease * 1.3); ease = Math.min(3.2, ease + 0.15); }
      const due = new Date(Date.now() + interval * 86400000).toISOString().slice(0, 10);
      return { ...state, flashcards: { ...state.flashcards, [action.cardId]: { ease, interval: Math.max(1, interval), due, lapses: action.rating === 0 ? prev.lapses + 1 : prev.lapses } } };
    }
    case 'ADD_INTERVIEW':
      return { ...state, interviewHistory: [action.entry, ...state.interviewHistory].slice(0, 20) };
    case 'COMPLETE_MISSION': {
      if (state.missionsCompleted.includes(action.id)) return state;
      return { ...state, missionsCompleted: [...state.missionsCompleted, action.id], xp: state.xp + action.xp };
    }
    case 'ADD_XP':
      return { ...state, xp: state.xp + action.xp };
    case 'AWARD_BADGE':
      return state.badges.includes(action.id) ? state : { ...state, badges: [...state.badges, action.id] };
    case 'SET_ONBOARDING':
      return { ...state, onboardingDone: true, diagnostic: action.diagnostic };
    case 'SAVE_STORY':
      return { ...state, projectStories: { ...state.projectStories, [action.key]: action.text } };
    case 'RESET':
      return initialProgress();
    default:
      return state;
  }
}

interface AppCtx {
  progress: UserProgress;
  dispatch: React.Dispatch<Action>;
  xpToast: string | null;
  awardXp: (xp: number, label?: string) => void;
  touchDaily: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialProgress);
  const [xpToast, setXpToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = storageService.load<UserProgress>(storageService.progressKey, initialProgress());
    // streak accounting
    const today = todayKey();
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let streak = saved.streak ?? 0;
    const days = [...(saved.streakDays ?? [])];
    if (saved.lastActiveDate !== today) {
      if (saved.lastActiveDate === yesterday) streak += 1;
      else if (saved.lastActiveDate !== '' && saved.lastActiveDate < yesterday) streak = 1;
      else if (saved.lastActiveDate === '') streak = 1;
      if (!days.includes(today)) days.push(today);
      saved.streak = streak;
      saved.lastActiveDate = today;
      saved.streakDays = days.slice(-182);
    }
    dispatch({ type: 'HYDRATE', value: saved });
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hydrated) storageService.save(storageService.progressKey, state);
  }, [state, hydrated]);

  const awardXp = (xp: number, label?: string) => {
    if (xp > 0) dispatch({ type: 'ADD_XP', xp });
    setXpToast(xp > 0 ? `+${xp} XP${label ? ` · ${label}` : ''}` : (label ?? 'Saved'));
    window.setTimeout(() => setXpToast(null), 2400);
  };

  const touchDaily = () => {
    /* streak handled on load; keep for explicit activity pings */
  };

  const value = useMemo(() => ({ progress: state, dispatch, xpToast, awardXp, touchDaily }), [state, xpToast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp outside provider');
  return ctx;
}

export function masteryRecommendations(progress: UserProgress): string[] {
  const recs: string[] = [];
  const entries = Object.entries(progress.mastery).sort((a, b) => a[1].pct - b[1].pct);
  const weak = entries.filter(([, m]) => m.seen >= 3 && m.pct < 70).slice(0, 3);
  const map: Record<string, string> = {
    Agents: 'You keep missing tool-authorization questions — review Tool Calling → Security.',
    RAG: 'Retrieval misses are dragging you down — review RAG chunking + hybrid + rerank.',
    Evaluation: 'Metric questions are shaky — replay the Precision/Recall game and Confusion Matrix lesson.',
    Engineering: 'API/debugging slips — run the API Lab + Debugging Lab once more.',
    'System Design': 'System-design answers lack structure — redo the whiteboard method lesson.',
    Data: 'Data-quality gaps — replay the Data Quality game.',
    LLMs: 'Sampling/context slips — review Tokens & Temperature lessons.',
    'FDE Craft': 'Ambiguity/partner answers need structure — practice the 4-box + discovery script.',
    Communication: 'Story answers need numbers — rebuild one project story with metrics.',
    Infra: 'Infra gaps — click through the Docker Visualizer again.',
  };
  weak.forEach(([k]) => { if (map[k]) recs.push(map[k]); });
  if (progress.completedLessons.length < 5) recs.push('Continue the next lesson in your path — consistency beats cramming.');
  if (progress.quizResults.length === 0) recs.push('Take one 5-question quiz to calibrate your mastery profile.');
  return recs.slice(0, 4);
}
