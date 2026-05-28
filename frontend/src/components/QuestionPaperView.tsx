import { useState } from 'react';
import type { MCQQuestion, Question, QuestionPaper, TrueFalseQuestion } from '../types';
import { exportAnswerKey, exportToPDF } from '../services/exportPDF';

interface Props {
  paper: QuestionPaper;
  onReset: () => void;
}

const MCQ_LABELS = ['A', 'B', 'C', 'D'];

// ─── Per-question edit form ───────────────────────────────────────────────────

interface EditFormProps {
  question: Question;
  onSave: (updated: Question) => void;
  onCancel: () => void;
}

function EditForm({ question, onSave, onCancel }: EditFormProps) {
  const [text, setText] = useState(question.question);

  // MCQ state
  const mcq = question as MCQQuestion;
  const [options, setOptions] = useState<[string, string, string, string]>(
    question.type === 'MCQ' ? [...mcq.options] as [string, string, string, string] : ['', '', '', '']
  );
  const [mcqAnswer, setMcqAnswer] = useState<string>(
    question.type === 'MCQ' ? (mcq.answer ?? options[0]) : ''
  );

  // True/False state
  const [tfAnswer, setTfAnswer] = useState<'True' | 'False'>(
    question.type === 'True/False' ? ((question as TrueFalseQuestion).answer ?? 'True') : 'True'
  );

  // Short / Broad answer state
  const [writtenAnswer, setWrittenAnswer] = useState<string>(
    (question.type === 'Short Question' || question.type === 'Broad Question')
      ? (question.answer ?? '') : ''
  );

  function handleSave() {
    if (!text.trim()) return;

    let updated: Question;

    if (question.type === 'MCQ') {
      const filledOptions = options.map((o) => o.trim()) as [string, string, string, string];
      const answer = filledOptions.includes(mcqAnswer) ? mcqAnswer : filledOptions[0];
      updated = { ...question, question: text.trim(), options: filledOptions, answer };
    } else if (question.type === 'True/False') {
      updated = { ...question, question: text.trim(), answer: tfAnswer };
    } else {
      updated = { ...question, question: text.trim(), answer: writtenAnswer.trim() || undefined };
    }

    onSave(updated);
  }

  return (
    <div className="border rounded p-3 mb-4 bg-light">
      {/* Question text */}
      <div className="mb-3">
        <label className="form-label small fw-semibold">Question</label>
        <textarea
          className="form-control form-control-sm"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* MCQ options + correct answer */}
      {question.type === 'MCQ' && (
        <div className="mb-3">
          <label className="form-label small fw-semibold">Options <span className="text-muted fw-normal">(select correct)</span></label>
          {options.map((opt, i) => (
            <div key={i} className="input-group input-group-sm mb-1">
              <span className="input-group-text">
                <input
                  type="radio"
                  name={`mcq-answer-${question.id}`}
                  checked={mcqAnswer === opt}
                  onChange={() => setMcqAnswer(opt)}
                  title="Mark as correct"
                />
              </span>
              <span className="input-group-text">{MCQ_LABELS[i]}</span>
              <input
                type="text"
                className="form-control"
                value={opt}
                onChange={(e) => {
                  const next = [...options] as [string, string, string, string];
                  const wasAnswer = mcqAnswer === options[i];
                  next[i] = e.target.value;
                  setOptions(next);
                  if (wasAnswer) setMcqAnswer(e.target.value);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* True/False answer */}
      {question.type === 'True/False' && (
        <div className="mb-3">
          <label className="form-label small fw-semibold">Answer</label>
          <div className="d-flex gap-3">
            {(['True', 'False'] as const).map((val) => (
              <label key={val} className="d-flex align-items-center gap-1 user-select-none">
                <input
                  type="radio"
                  name={`tf-answer-${question.id}`}
                  checked={tfAnswer === val}
                  onChange={() => setTfAnswer(val)}
                />
                {val}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Short / Broad answer */}
      {(question.type === 'Short Question' || question.type === 'Broad Question') && (
        <div className="mb-3">
          <label className="form-label small fw-semibold">Answer</label>
          <textarea
            className="form-control form-control-sm"
            rows={question.type === 'Broad Question' ? 4 : 2}
            value={writtenAnswer}
            onChange={(e) => setWrittenAnswer(e.target.value)}
          />
        </div>
      )}

      <div className="d-flex gap-2">
        <button className="btn btn-sm btn-primary" onClick={handleSave}>Save</button>
        <button className="btn btn-sm btn-outline-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Single question (view + edit toggle) ────────────────────────────────────

interface QuestionItemProps {
  question: Question;
  index: number;
  showAnswers: boolean;
  onUpdate: (updated: Question) => void;
}

function QuestionItem({ question, index, showAnswers, onUpdate }: QuestionItemProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <EditForm
        question={question}
        onSave={(updated) => { onUpdate(updated); setEditing(false); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const mcq = question as MCQQuestion;

  return (
    <div className="mb-4 text-start">
      <div className="d-flex align-items-start justify-content-between gap-2">
        <p className="mb-1 fw-medium flex-grow-1">
          <span className="me-2 text-muted">{index}.</span>
          {question.question}
        </p>
        <button
          className="btn btn-sm btn-outline-secondary flex-shrink-0 py-0 px-2"
          style={{ fontSize: '0.75rem' }}
          onClick={() => setEditing(true)}
          title="Edit question"
        >
          Edit
        </button>
      </div>

      {question.type === 'MCQ' && (
        <ol className="list-unstyled ms-3 mb-1">
          {mcq.options.map((opt, i) => (
            <li
              key={i}
              className={showAnswers && opt === mcq.answer ? 'text-success fw-semibold' : ''}
            >
              <span className="me-2 text-muted">{MCQ_LABELS[i]}.</span>{opt}
            </li>
          ))}
        </ol>
      )}

      {question.type === 'True/False' && (
        <div className="ms-3 mb-1 d-flex gap-3">
          {['True', 'False'].map((opt) => (
            <span
              key={opt}
              className={showAnswers && opt === question.answer ? 'text-success fw-semibold' : 'text-muted'}
            >
              {opt}
            </span>
          ))}
        </div>
      )}

      {showAnswers && question.answer &&
        question.type !== 'MCQ' && question.type !== 'True/False' && (
          <p className="ms-3 mb-0 text-success small fst-italic">Answer: {question.answer}</p>
        )}
    </div>
  );
}

// ─── Paper editor ─────────────────────────────────────────────────────────────

export default function QuestionPaperView({ paper: initialPaper, onReset }: Props) {
  const [paper, setPaper] = useState<QuestionPaper>(initialPaper);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(initialPaper.title);
  const [showAnswers, setShowAnswers] = useState(false);
  const [exporting, setExporting] = useState<'paper' | 'answers' | null>(null);

  async function handleExport() {
    setExporting('paper');
    try { await exportToPDF(paper, showAnswers); }
    finally { setExporting(null); }
  }

  async function handleExportAnswers() {
    setExporting('answers');
    try { await exportAnswerKey(paper); }
    finally { setExporting(null); }
  }

  function updateQuestion(updated: Question) {
    setPaper((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => q.id === updated.id ? updated : q),
    }));
  }

  function saveTitle() {
    setPaper((prev) => ({ ...prev, title: titleDraft.trim() || prev.title }));
    setEditingTitle(false);
  }

  const grouped = paper.questions.reduce<Record<string, Question[]>>((acc, q) => {
    (acc[q.type] ??= []).push(q);
    return acc;
  }, {});

  let counter = 1;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-2">
        <div className="flex-grow-1">
          {editingTitle ? (
            <div className="d-flex gap-2 align-items-center">
              <input
                className="form-control form-control-sm"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                autoFocus
              />
              <button className="btn btn-sm btn-primary" onClick={saveTitle}>Save</button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingTitle(false)}>Cancel</button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <h4 className="mb-0">{paper.title || 'Question Paper'}</h4>
              <button
                className="btn btn-sm btn-outline-secondary py-0 px-2"
                style={{ fontSize: '0.75rem' }}
                onClick={() => { setTitleDraft(paper.title); setEditingTitle(true); }}
                title="Edit title"
              >
                Edit
              </button>
            </div>
          )}
          <span className="text-muted small">
            {paper.questions.length} question{paper.questions.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="d-flex gap-2 align-items-center flex-shrink-0">
          <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="showAnswers"
              checked={showAnswers}
              onChange={(e) => setShowAnswers(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="showAnswers">Answer key</label>
          </div>
          <button
            className="btn btn-sm btn-primary"
            onClick={handleExport}
            disabled={exporting !== null}
          >
            {exporting === 'paper'
              ? <><span className="spinner-border spinner-border-sm me-1" role="status" />Exporting…</>
              : 'Download PDF'}
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={handleExportAnswers}
            disabled={exporting !== null}
          >
            {exporting === 'answers'
              ? <><span className="spinner-border spinner-border-sm me-1" role="status" />Exporting…</>
              : 'Download Answer Key'}
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={onReset}>
            Start over
          </button>
        </div>
      </div>

      {/* Sections */}
      {Object.entries(grouped).map(([type, questions]) => (
        <section key={type} className="mb-5">
          <h6 className="text-uppercase border-bottom pb-1 mb-3 small fw-bold text-start">
            {type}
          </h6>
          {questions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              index={counter++}
              showAnswers={showAnswers}
              onUpdate={updateQuestion}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
