import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/layout';
import { Home, Dashboard, NotFound } from './pages/core';
import { Learn, LessonDetail } from './pages/learn';
import { PracticeHub, QuizPage, FlashcardsPage, ScenariosPage, CodingPage, SystemDesignPracticePage, TradeoffsPage, AnswerTrainerPage } from './pages/practice';
import { LabsHub, RagLab, EmbeddingLab, AgentLab, EvalLab, PrecisionRecallLab, DataQualityLab, TaxonomyLab, ToolDesignLab, WorkflowAgentLab, SystemDesignSimLab, DockerLab, ApiLab, DebugLab, AmbiguousLab, PartnerLab } from './pages/labs';
import { InterviewSimulator } from './pages/interview';
import { ProjectsPage, ProgressPage, AchievementsPage, ReviewPage, SettingsPage } from './pages/more';

export default function App() {
  return (
    <Shell>
      <Suspense fallback={<div className="card">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:id" element={<LessonDetail />} />
          <Route path="/fundamentals" element={<Navigate to="/learn" replace />} />
          <Route path="/llms" element={<Navigate to="/learn/llms" replace />} />
          <Route path="/rag" element={<Navigate to="/learn/rag" replace />} />
          <Route path="/agents" element={<Navigate to="/learn/tool-calling" replace />} />
          <Route path="/evaluation" element={<Navigate to="/learn/precision-recall-f1" replace />} />
          <Route path="/data-intelligence" element={<Navigate to="/learn/data-quality" replace />} />
          <Route path="/python" element={<Navigate to="/learn/python-for-ai" replace />} />
          <Route path="/backend" element={<Navigate to="/learn/rest-apis" replace />} />
          <Route path="/infrastructure" element={<Navigate to="/learn/docker" replace />} />
          <Route path="/system-design" element={<Navigate to="/learn/ai-system-design" replace />} />
          <Route path="/partner-engineering" element={<Navigate to="/learn/partner-engineering" replace />} />
          <Route path="/practice" element={<PracticeHub />} />
          <Route path="/practice/quiz" element={<QuizPage />} />
          <Route path="/practice/flashcards" element={<FlashcardsPage />} />
          <Route path="/practice/scenarios" element={<ScenariosPage />} />
          <Route path="/practice/coding" element={<CodingPage />} />
          <Route path="/practice/system-design" element={<SystemDesignPracticePage />} />
          <Route path="/practice/tradeoffs" element={<TradeoffsPage />} />
          <Route path="/practice/trainer" element={<AnswerTrainerPage />} />
          <Route path="/practice/labs" element={<LabsHub />} />
          <Route path="/practice/labs/rag" element={<RagLab />} />
          <Route path="/practice/labs/embeddings" element={<EmbeddingLab />} />
          <Route path="/practice/labs/agent" element={<AgentLab />} />
          <Route path="/practice/labs/eval" element={<EvalLab />} />
          <Route path="/practice/labs/precision-recall" element={<PrecisionRecallLab />} />
          <Route path="/practice/labs/data-quality" element={<DataQualityLab />} />
          <Route path="/practice/labs/taxonomy" element={<TaxonomyLab />} />
          <Route path="/practice/labs/tool-design" element={<ToolDesignLab />} />
          <Route path="/practice/labs/workflow-agent" element={<WorkflowAgentLab />} />
          <Route path="/practice/labs/system-design" element={<SystemDesignSimLab />} />
          <Route path="/practice/labs/docker" element={<DockerLab />} />
          <Route path="/practice/labs/api" element={<ApiLab />} />
          <Route path="/practice/labs/debugging" element={<DebugLab />} />
          <Route path="/practice/labs/ambiguous" element={<AmbiguousLab />} />
          <Route path="/practice/labs/partner" element={<PartnerLab />} />
          <Route path="/interview/simulator" element={<InterviewSimulator />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Shell>
  );
}
