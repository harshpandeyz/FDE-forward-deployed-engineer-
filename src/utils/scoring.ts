export function scoreQuiz(answers: Record<string, number | number[]>, questions: { id: string; correctAnswer: number | number[] }[]) {
  let correct = 0;
  const misses: string[] = [];
  for (const q of questions) {
    const a = answers[q.id];
    const ok = Array.isArray(q.correctAnswer)
      ? Array.isArray(a) && [...a].sort().join(',') === [...q.correctAnswer].sort().join(',')
      : a === q.correctAnswer;
    if (ok) correct++;
    else misses.push(q.id);
  }
  return { correct, total: questions.length, misses };
}

export const READINESS_WEIGHTS = { Knowledge: 0.25, Practical: 0.25, AISystems: 0.2, Engineering: 0.15, Communication: 0.15 };

export function readinessFromMastery(mastery: Record<string, { pct: number }>, interviewAvg?: number) {
  const g = (k: string) => mastery[k]?.pct ?? 0;
  const knowledge = Math.round((g('LLMs') + g('Evaluation')) / 2);
  const practical = Math.round((g('RAG') + g('Data')) / 2);
  const aiSystems = Math.round((g('Agents') + g('System Design')) / 2);
  const engineering = Math.round((g('Engineering') + g('Infra')) / 2);
  const communication = interviewAvg ?? Math.round((g('FDE Craft') + g('Communication')) / 2);
  const score = Math.round(
    knowledge * READINESS_WEIGHTS.Knowledge +
    practical * READINESS_WEIGHTS.Practical +
    aiSystems * READINESS_WEIGHTS.AISystems +
    engineering * READINESS_WEIGHTS.Engineering +
    communication * READINESS_WEIGHTS.Communication
  );
  return { score, breakdown: { Knowledge: knowledge, Practical: practical, AISystems: aiSystems, Engineering: engineering, Communication: communication } };
}
