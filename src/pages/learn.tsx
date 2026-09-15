import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, Bookmark, BookmarkCheck, ArrowLeft, ArrowRight, CircleCheck } from 'lucide-react';
import { LESSONS, lessonById } from '../data/lessons';
import { MODULES } from '../data/modules';
import { questionById } from '../data/questions';
import { useApp } from '../store';
import { Chip, ProgressBar, FlowDiagram } from '../components/ui';

export function Learn() {
  const { progress } = useApp();
  const [filter, setFilter] = useState('');
  const done = new Set(progress.completedLessons);
  const list = LESSONS.filter((l) => !filter || (l.title + l.summary + l.tags.join(' ')).toLowerCase().includes(filter.toLowerCase()));
  return (
    <div>
      <h1 className="page-title">Learn</h1>
      <p className="page-sub">25 core lessons across 10 phases. {progress.completedLessons.length}/{LESSONS.length} complete. Every lesson is labeled by content type with sources + last-verified date.</p>
      <input type="search" className="text-input" placeholder="Filter lessons…" aria-label="Filter lessons" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth: 420 }} />
      {MODULES.map((m) => {
        const ls = list.filter((l) => l.moduleId === m.id);
        if (!ls.length) return null;
        return (
          <section key={m.id} style={{ marginTop: 20 }}>
            <h2>{m.index}. {m.title}</h2>
            <p className="small muted">{m.blurb}</p>
            <div className="grid grid-3">
              {ls.map((l) => (
                <div key={l.id} className="card hoverable">
                  <p><Chip kind={l.difficulty === 'Foundations' ? 'success' : l.difficulty === 'Intermediate' ? 'info' : 'warning'}>{l.difficulty}</Chip> <Chip>{l.estimatedMinutes} min</Chip> <Chip kind="accent">{l.xp} XP</Chip> {done.has(l.id) && <Chip kind="success">✓ Done</Chip>}</p>
                  <h3><Link to={`/learn/${l.id}`}>{l.title}</Link></h3>
                  <p className="small">{l.summary}</p>
                  <p className="caption muted">{l.label}</p>
                  <Link className="btn btn-sm" to={`/learn/${l.id}`}>{done.has(l.id) ? 'Review' : 'Start'}</Link>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      {list.length === 0 && <div className="card">No lessons match “{filter}”. <button className="btn btn-sm" onClick={() => setFilter('')}>Clear</button></div>}
    </div>
  );
}

export function LessonDetail() {
  const { id } = useParams();
  const lesson = lessonById(id ?? '');
  const { progress, dispatch, awardXp } = useApp();
  const [note, setNote] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizDone, setQuizDone] = useState(false);

  const idx = LESSONS.findIndex((l) => l.id === id);
  const prev = idx > 0 ? LESSONS[idx - 1] : null;
  const next = idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null;

  const miniQs = useMemo(() => (lesson?.miniQuizIds ?? []).map(questionById).filter(Boolean) as NonNullable<ReturnType<typeof questionById>>[], [lesson]);
  const mastery = lesson ? progress.mastery[lesson.masteryKey] : undefined;
  const isDone = lesson ? progress.completedLessons.includes(lesson.id) : false;
  const bookmarked = lesson ? progress.bookmarks.includes(`lesson:${lesson.id}`) : false;
  const notes = lesson ? progress.notes[lesson.id] ?? [] : [];
  const [noteQuery, setNoteQuery] = useState('');

  if (!lesson) return <div className="card"><h2>Lesson not found</h2><Link className="btn" to="/learn">Back to Learn</Link></div>;

  const quizScore = miniQs.filter((q) => quizAnswers[q.id] === q.correctAnswer).length;

  return (
    <div className="two-col">
      <article className="lesson-body">
        <Link to="/learn" className="btn btn-sm btn-ghost"><ArrowLeft size={14} /> All lessons</Link>
        <p style={{ marginTop: 12 }}><Chip kind="info">{lesson.label}</Chip> <Chip>{lesson.module}</Chip> <Chip kind={lesson.difficulty === 'Foundations' ? 'success' : lesson.difficulty === 'Intermediate' ? 'info' : 'warning'}>{lesson.difficulty}</Chip></p>
        <h1 className="page-title">{lesson.title}</h1>
        <p className="page-sub"><Clock size={14} /> {lesson.estimatedMinutes} min · {lesson.xp} XP · Mastery {mastery?.pct ?? 0}% ({mastery?.correct ?? 0}/{mastery?.seen ?? 0}) · Prerequisites: {lesson.prerequisites.join(', ') || 'none'}</p>
        <ProgressBar value={mastery?.pct ?? 0} label={`${lesson.masteryKey} mastery`} />

        {lesson.sections.map((s, i) => (
          <section key={i}>
            <h2>{s.heading}</h2>
            {s.body.map((p, j) => <p key={j}>{p}</p>)}
            {s.bullets && <ul>{s.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
            {s.code && <pre aria-label={`Code example in ${s.code.language}`}><code>{s.code.code}</code></pre>}
            {s.callout && <div className={`callout ${s.callout.kind === 'info' ? 'info' : s.callout.kind === 'warn' ? 'warn' : s.callout.kind === 'good' ? 'good' : 'bad'}`}>{s.callout.text}</div>}
          </section>
        ))}

        {lesson.diagram && <FlowDiagram title={lesson.diagram.title} caption={lesson.diagram.caption} nodes={lesson.diagram.nodes} />}

        {miniQs.length > 0 && (
          <section className="card" style={{ marginTop: 18 }}>
            <h2>Mini quiz — check understanding</h2>
            {!quizDone ? (
              <div className="grid">
                {miniQs.map((q) => (
                  <div key={q.id}>
                    <p><strong>{q.question}</strong></p>
                    <div className="grid">
                      {q.options.map((o, oi) => (
                        <button key={oi} className={`quiz-opt${quizAnswers[q.id] === oi ? ' correct' : ''}`} onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: oi })} aria-pressed={quizAnswers[q.id] === oi}>{o}</button>
                      ))}
                    </div>
                    {quizAnswers[q.id] !== undefined && quizAnswers[q.id] !== q.correctAnswer && <p className="small" style={{ color: 'var(--danger)' }}>Not quite — answer below after submitting. Hint: {q.explanation.slice(0, 120)}…</p>}
                  </div>
                ))}
                <button className="btn btn-primary" disabled={Object.keys(quizAnswers).length < miniQs.length} onClick={() => {
                  setQuizDone(true);
                  const xp = quizScore * 5;
                  if (xp) awardXp(xp, 'mini quiz');
                }}>Submit mini quiz</button>
              </div>
            ) : (
              <div>
                <p><strong>Score: {quizScore}/{miniQs.length}</strong></p>
                {miniQs.map((q) => (
                  <div key={q.id} className={quizAnswers[q.id] === q.correctAnswer ? 'alert success' : 'alert error'} style={{ marginBottom: 8 }}>
                    <p><strong>{q.question}</strong></p>
                    <p className="small">{quizAnswers[q.id] === q.correctAnswer ? 'Correct. ' : `Incorrect because — ${q.explanation} `} {q.trap && <em>Trap: {q.trap}</em>}</p>
                  </div>
                ))}
                <button className="btn btn-sm" onClick={() => { setQuizDone(false); setQuizAnswers({}); }}>Retry</button>
              </div>
            )}
          </section>
        )}

        <section className="card" style={{ marginTop: 16 }}>
          <h2>Takeaway + Sources</h2>
          <p className="caption muted">Label: {lesson.label} · Last verified: {lesson.lastVerified} · Tags: {lesson.tags.join(', ')}</p>
          <ul>{lesson.sources.map((s, i) => <li key={i} className="small">{s}</li>)}</ul>
          <p className="small">Practice note: interview framings here are <em>practice questions</em>, not real or internal questions from any employer.</p>
        </section>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {prev && <Link className="btn" to={`/learn/${prev.id}`}><ArrowLeft size={14} /> {prev.title.slice(0, 24)}…</Link>}
          {next && <Link className="btn btn-primary" to={`/learn/${next.id}`}>{next.title.slice(0, 24)}… <ArrowRight size={14} /></Link>}
        </div>
      </article>

      <aside className="side-panel">
        <div className="card">
          <h3>Progress</h3>
          {isDone ? <p className="small"><CircleCheck size={14} /> Completed — {lesson.xp} XP earned.</p> : <button className="btn btn-primary" onClick={() => { dispatch({ type: 'COMPLETE_LESSON', id: lesson.id, xp: lesson.xp }); awardXp(0, `${lesson.xp} XP banked`); const el = document.getElementById('main'); el?.focus?.(); }}>Mark complete · +{lesson.xp} XP</button>}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn btn-sm" onClick={() => dispatch({ type: 'TOGGLE_BOOKMARK', id: `lesson:${lesson.id}` })} aria-pressed={bookmarked}>
              {bookmarked ? <><BookmarkCheck size={14} /> Bookmarked</> : <><Bookmark size={14} /> Bookmark</>}
            </button>
          </div>
        </div>
        <div className="card">
          <h3>My notes ({notes.length})</h3>
          <input className="text-input" placeholder="Search notes…" aria-label="Search notes" value={noteQuery} onChange={(e) => setNoteQuery(e.target.value)} style={{ marginBottom: 8 }} />
          <div className="note-box">
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" aria-label="Add a note" />
            <button className="btn btn-sm" style={{ marginTop: 8 }} disabled={!note.trim()} onClick={() => { dispatch({ type: 'ADD_NOTE', lessonId: lesson.id, text: note.trim() }); setNote(''); }}>Add note</button>
          </div>
          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {notes.filter((n) => !noteQuery || n.text.toLowerCase().includes(noteQuery.toLowerCase())).map((n) => (
              <NoteRow key={n.id} lessonId={lesson.id} note={n} />
            ))}
            {notes.length === 0 && <p className="caption muted">No notes yet — they persist across refreshes and feed Review.</p>}
          </div>
        </div>
      </aside>
    </div>
  );
}

function NoteRow({ lessonId, note }: { lessonId: string; note: { id: string; text: string; updated: string } }) {
  const { dispatch } = useApp();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text);
  if (editing) {
    return (
      <div>
        <textarea className="text-input" rows={2} value={text} onChange={(e) => setText(e.target.value)} aria-label="Edit note" />
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <button className="btn btn-sm btn-primary" onClick={() => { dispatch({ type: 'EDIT_NOTE', lessonId, noteId: note.id, text }); setEditing(false); }}>Save</button>
          <button className="btn btn-sm" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
      <p className="small" style={{ margin: 0 }}>{note.text}</p>
      <p className="caption muted">{new Date(note.updated).toLocaleString()}</p>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-sm" onClick={() => setEditing(true)}>Edit</button>
        <button className="btn btn-sm" onClick={() => dispatch({ type: 'DELETE_NOTE', lessonId, noteId: note.id })}>Delete</button>
      </div>
    </div>
  );
}
