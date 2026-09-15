export interface Module { id: string; index: number; title: string; blurb: string; icon: string; lessonIds: string[] }

export const MODULES: Module[] = [
  { id: 'foundations', index: 1, title: 'Engineering Foundations', blurb: 'Python, HTTP, REST, JSON, databases, auth, testing.', icon: 'Code2', lessonIds: ['python-for-ai', 'rest-apis', 'databases'] },
  { id: 'ai-foundations', index: 2, title: 'AI Foundations', blurb: 'Tokens, LLMs, inference, prompting, structured output.', icon: 'Brain', lessonIds: ['llms', 'tokens-context', 'prompting'] },
  { id: 'knowledge', index: 3, title: 'Knowledge Systems', blurb: 'Embeddings, vector search, chunking, RAG, reranking.', icon: 'Database', lessonIds: ['embeddings', 'vector-search', 'rag', 'rag-eval'] },
  { id: 'agents', index: 4, title: 'Agentic AI', blurb: 'Tools, loops, planning, memory, workflows, eval.', icon: 'Bot', lessonIds: ['tool-calling', 'workflows-vs-agents', 'agent-architecture', 'agent-memory', 'agent-eval'] },
  { id: 'data', index: 5, title: 'Data Intelligence', blurb: 'Pipelines, quality, taxonomy, labeling, eval datasets.', icon: 'TableProperties', lessonIds: ['data-quality', 'taxonomies'] },
  { id: 'eval', index: 6, title: 'AI Evaluation', blurb: 'Precision/recall, retrieval metrics, faithfulness, cost.', icon: 'Gauge', lessonIds: ['precision-recall-f1'] },
  { id: 'infra', index: 7, title: 'Infrastructure', blurb: 'Docker, deploy, monitoring, observability.', icon: 'Container', lessonIds: ['docker', 'observability'] },
  { id: 'system-design', index: 8, title: 'System Design', blurb: 'Requirements, architecture, scaling, failure handling.', icon: 'Network', lessonIds: ['ai-system-design'] },
  { id: 'fde', index: 9, title: 'Forward Deployed Engineering', blurb: 'Ambiguity, discovery, stakeholders, prototype to prod.', icon: 'Rocket', lessonIds: ['ambiguous-problem-solving', 'partner-engineering'] },
  { id: 'masterclass', index: 10, title: 'Interview Masterclass', blurb: 'Stories, STAR, system design, AI cases, mocks.', icon: 'Mic', lessonIds: ['project-interviews', 'final-prep'] },
];
