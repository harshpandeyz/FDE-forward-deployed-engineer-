export type Difficulty = 'Foundations' | 'Intermediate' | 'Advanced';
export type ContentLabel = 'Verified role information' | 'General industry preparation' | 'Interview prediction / practice scenario';

export interface LessonSection {
  heading: string;
  body: string[];
  bullets?: string[];
  code?: { language: string; code: string };
  callout?: { kind: 'info' | 'warn' | 'good' | 'bad'; text: string };
}

export interface Lesson {
  id: string;
  title: string;
  module: string;
  moduleId: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  xp: number;
  summary: string;
  label: ContentLabel;
  prerequisites: string[];
  tags: string[];
  sources: string[];
  lastVerified: string;
  masteryKey: string;
  sections: LessonSection[];
  miniQuizIds: string[];
  diagram?: { title: string; caption: string; nodes: string[] };
}

export interface Question {
  id: string;
  category: string;
  type: 'mcq' | 'multi' | 'tf' | 'ordering' | 'scenario' | 'code';
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number | number[];
  explanation: string;
  trap?: string;
  followUps?: string[];
  skill: string;
  xp: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  tag: string;
}

export interface Scenario {
  id: string;
  title: string;
  difficulty: Difficulty;
  domain: string;
  problem: string;
  constraints: string[];
  data: string;
  apis: string;
  requirements: string[];
  task: string;
  architectureChoices: { name: string; when: string; risks: string }[];
  eval: string[];
  failureCases: string[];
  solution: string;
}

export interface QuizResult {
  id: string;
  date: string;
  category: string;
  total: number;
  correct: number;
  xpEarned: number;
  questionIds: string[];
  misses: string[];
}

export interface UserProgress {
  completedLessons: string[];
  quizResults: QuizResult[];
  mastery: Record<string, { seen: number; correct: number; pct: number }>;
  xp: number;
  streak: number;
  lastActiveDate: string;
  streakDays: string[];
  badges: string[];
  bookmarks: string[];
  notes: Record<string, { id: string; lessonId: string; text: string; updated: string }[]>;
  flashcards: Record<string, { ease: number; interval: number; due: string; lapses: number }>;
  interviewHistory: { id: string; date: string; score: number; breakdown: Record<string, number> }[];
  missionsCompleted: string[];
  onboardingDone: boolean;
  diagnostic: { strengths: string[]; gaps: string[] } | null;
  projectStories: Record<string, string>;
}

export const LEVELS = [
  { level: 1, name: 'AI Explorer', minXp: 0 },
  { level: 2, name: 'Prompt Crafter', minXp: 300 },
  { level: 3, name: 'RAG Builder', minXp: 800 },
  { level: 4, name: 'Agent Designer', minXp: 1500 },
  { level: 5, name: 'AI Evaluator', minXp: 2500 },
  { level: 6, name: 'Systems Architect', minXp: 3800 },
  { level: 7, name: 'Forward Deployed Engineer', minXp: 5500 },
];

export function levelForXp(xp: number) {
  let current = LEVELS[0];
  let next: (typeof LEVELS)[number] | null = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) current = LEVELS[i];
    if (xp < LEVELS[i].minXp) { next = LEVELS[i]; break; }
  }
  return { current, next };
}
