import { useState } from 'react';
import type { MCQQuestion, Question, QuestionPaper } from '../types';

interface Props {
  paper: QuestionPaper;
  onReset: () => void;
}

const MCQ_LABELS = ['A', 'B', 'C', 'D'];

function QuestionItem({ question, index, showAnswers }: { question: Question; index: number; showAnswers: boolean }) {
  return (
    <div className="mb-4 text-start">
      <p className="mb-1 fw-medium">
        <span className="me-2 text-muted">{index}.</span>
        {question.question}
      </p>

      {question.type === 'MCQ' && (
        <ol className="list-unstyled ms-3 mb-1" type="A">
          {(question as MCQQuestion).options.map((opt, i) => (
            <li key={i} className={showAnswers && opt === (question as MCQQuestion).answer ? 'text-success fw-semibold' : ''}>
              <span className="me-2 text-muted">{MCQ_LABELS[i]}.</span>{opt}
            </li>
          ))}
        </ol>
      )}

      {question.type === 'True/False' && (
        <div className="ms-3 mb-1 d-flex gap-3">
          {['True', 'False'].map((opt) => (
            <span key={opt} className={showAnswers && opt === question.answer ? 'text-success fw-semibold' : 'text-muted'}>
              {opt}
            </span>
          ))}
        </div>
      )}

      {showAnswers && question.answer && question.type !== 'MCQ' && question.type !== 'True/False' && (
        <p className="ms-3 mb-0 text-success small fst-italic">Answer: {question.answer}</p>
      )}
    </div>
  );
}

export default function QuestionPaperView({ paper, onReset }: Props) {
  const [showAnswers, setShowAnswers] = useState(false);

  // Group questions by type for sectioned display
  const grouped = paper.questions.reduce<Record<string, Question[]>>((acc, q) => {
    (acc[q.type] ??= []).push(q);
    return acc;
  }, {});

  let counter = 1;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-0">{paper.title || 'Question Paper'}</h4>
          <span className="text-muted small">{paper.questions.length} question{paper.questions.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="d-flex gap-2">
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
          <button className="btn btn-sm btn-outline-secondary" onClick={onReset}>
            Start over
          </button>
        </div>
      </div>

      {Object.entries(grouped).map(([type, questions]) => (
        <section key={type} className="mb-5">
          <h6 className="text-uppercase border-bottom pb-1 mb-3 small fw-bold text-start">
            {type}
          </h6>
          {questions.map((q) => (
            <QuestionItem key={q.id} question={q} index={counter++} showAnswers={showAnswers} />
          ))}
        </section>
      ))}
    </div>
  );
}
