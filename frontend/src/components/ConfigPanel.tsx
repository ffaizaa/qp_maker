import { useState } from 'react';
import type { Difficulty, PaperConfig, QuestionCounts, QuestionType } from '../types';

const QUESTION_TYPES: QuestionType[] = ['MCQ', 'Short Question', 'Broad Question', 'True/False'];
const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

interface Props {
  onGenerate: (config: PaperConfig) => void;
  loading: boolean;
}

export default function ConfigPanel({ onGenerate, loading }: Props) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [counts, setCounts] = useState<QuestionCounts>({ MCQ: 5 });

  const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);

  function setCount(type: QuestionType, raw: string) {
    const val = Math.max(0, parseInt(raw) || 0);
    setCounts((prev) => ({ ...prev, [type]: val || undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (total === 0) return;
    onGenerate({ title: title.trim(), difficulty, counts });
  }

  const canSubmit = total > 0 && !loading;

  return (
    <form onSubmit={handleSubmit} className="card h-100">
      <div className="card-header fw-semibold">Configure Paper</div>

      <div className="card-body d-flex flex-column gap-4">

        {/* Paper title */}
        <div>
          <label className="form-label fw-medium">Paper Title <span className="text-muted fw-normal">(optional)</span></label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Midterm Exam – Chapter 4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="form-label fw-medium">Difficulty</label>
          <div className="btn-group w-100" role="group" aria-label="Difficulty">
            {DIFFICULTIES.map((d) => (
              <label key={d} className={`btn btn-outline-primary${difficulty === d ? ' active' : ''}`}>
                <input
                  type="radio"
                  name="difficulty"
                  className="btn-check"
                  checked={difficulty === d}
                  onChange={() => setDifficulty(d)}
                />
                {d}
              </label>
            ))}
          </div>
        </div>

        {/* Question counts */}
        <div>
          <div className="d-flex justify-content-between align-items-baseline mb-2">
            <label className="form-label fw-medium mb-0">Questions</label>
            <span className="text-muted small">{total} total</span>
          </div>
          <div className="d-flex flex-column gap-2">
            {QUESTION_TYPES.map((type) => (
              <div key={type} className="d-flex align-items-center gap-3">
                <span className="flex-grow-1 small">{type}</span>
                <div className="d-flex align-items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary px-2 py-0"
                    style={{ lineHeight: '1.6' }}
                    disabled={(counts[type] ?? 0) === 0}
                    onClick={() => setCount(type, String((counts[type] ?? 0) - 1))}
                  >−</button>
                  <input
                    type="number"
                    className="form-control form-control-sm text-center"
                    style={{ width: '3.5rem' }}
                    min={0}
                    value={counts[type] ?? 0}
                    onChange={(e) => setCount(type, e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary px-2 py-0"
                    style={{ lineHeight: '1.6' }}
                    onClick={() => setCount(type, String((counts[type] ?? 0) + 1))}
                  >+</button>
                </div>
              </div>
            ))}
          </div>
          {total === 0 && (
            <p className="text-danger small mt-2 mb-0">Add at least one question.</p>
          )}
        </div>
      </div>

      <div className="card-footer">
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={!canSubmit}
        >
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2" role="status" />Generating…</>
          ) : (
            'Generate Paper'
          )}
        </button>
      </div>
    </form>
  );
}
