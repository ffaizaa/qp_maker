import { useState } from 'react';
import type { Difficulty, PaperConfig, QuestionCounts, QuestionType } from '../types';

const QUESTION_TYPES: QuestionType[] = ['MCQ', 'Short Question', 'Broad Question', 'True/False', 'Math Problem'];
const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const DIFFICULTY_STYLES: Record<Difficulty, { active: string; glow: string; label: string }> = {
  Easy:   { active: 'linear-gradient(135deg, #22c55e, #16a34a)', glow: 'rgba(34,197,94,0.3)',  label: '😊' },
  Medium: { active: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245,158,11,0.3)', label: '🎯' },
  Hard:   { active: 'linear-gradient(135deg, #ef4444, #dc2626)', glow: 'rgba(239,68,68,0.3)',  label: '🔥' },
};

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
    <>
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 4px 18px rgba(99,102,241,0.4); }
          50%       { box-shadow: 0 4px 28px rgba(168,85,247,0.6); }
        }
        .generate-btn:hover:not(:disabled) {
          transform: scale(1.025);
          box-shadow: 0 6px 24px rgba(99,102,241,0.5) !important;
        }
        .generate-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .counter-btn:hover:not(:disabled) {
          background: #6366f1 !important;
          color: #fff !important;
          border-color: #6366f1 !important;
          transform: scale(1.15);
        }
        .counter-btn:active:not(:disabled) {
          transform: scale(0.95);
        }
        .counter-btn {
          transition: all 0.15s ease !important;
        }
        .generate-btn {
          transition: transform 0.18s ease, box-shadow 0.18s ease !important;
        }
      `}</style>

      <form
        onSubmit={handleSubmit}
        className="h-100"
        style={{ borderRadius: '18px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(99,102,241,0.14), 0 2px 8px rgba(0,0,0,0.06)' }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          padding: '16px 20px',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1rem',
          letterSpacing: '0.3px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '1.1rem' }}>⚙️</span> Configure Paper
        </div>

        {/* Body */}
        <div className="d-flex flex-column gap-4 p-3" style={{ background: 'linear-gradient(160deg, #fafbff 0%, #f5f0ff 100%)' }}>

          {/* Paper title */}
          <div>
            <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#374151' }}>
              Paper Title <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
            </label>
            <input
              type="text"
              className="form-control"
              style={{ borderRadius: '10px', fontSize: '0.9rem', border: '1.5px solid #e5e7eb' }}
              placeholder="e.g. Midterm Exam – Chapter 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="form-label fw-semibold mb-2" style={{ fontSize: '0.85rem', color: '#374151' }}>Difficulty</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {DIFFICULTIES.map((d) => {
                const { active, glow, label } = DIFFICULTY_STYLES[d];
                const isSelected = difficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: '10px',
                      border: isSelected ? 'none' : '1.5px solid #e5e7eb',
                      background: isSelected ? active : '#fff',
                      color: isSelected ? '#fff' : '#6b7280',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: isSelected ? `0 4px 14px ${glow}` : 'none',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>{label}</span>
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question counts */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
              <label className="form-label fw-semibold mb-0" style={{ fontSize: '0.85rem', color: '#374151' }}>Questions</label>
              <span style={{
                fontSize: '12px', fontWeight: 700, color: '#6366f1',
                background: '#ede9fe', borderRadius: '999px', padding: '2px 10px',
              }}>{total} total</span>
            </div>
            <div className="d-flex flex-column gap-2">
              {QUESTION_TYPES.map((type) => {
                const count = counts[type] ?? 0;
                return (
                  <div key={type} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: count > 0 ? 'rgba(99,102,241,0.05)' : 'transparent',
                    borderRadius: '8px', padding: '4px 6px',
                    transition: 'background 0.2s ease',
                  }}>
                    <span style={{ flexGrow: 1, fontSize: '0.82rem', color: count > 0 ? '#4f46e5' : '#6b7280', fontWeight: count > 0 ? 600 : 400 }}>
                      {type}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        className="counter-btn"
                        disabled={count === 0}
                        onClick={() => setCount(type, String(count - 1))}
                        style={{
                          width: '26px', height: '26px', borderRadius: '7px',
                          border: '1.5px solid #e5e7eb', background: '#fff',
                          color: '#6b7280', fontWeight: 700, fontSize: '1rem',
                          cursor: count === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: count === 0 ? 0.35 : 1,
                          padding: 0,
                        }}
                      >−</button>
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        style={{ width: '3rem', borderRadius: '7px', fontSize: '0.85rem', border: '1.5px solid #e5e7eb', fontWeight: 600 }}
                        min={0}
                        value={count}
                        onChange={(e) => setCount(type, e.target.value)}
                      />
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => setCount(type, String(count + 1))}
                        style={{
                          width: '26px', height: '26px', borderRadius: '7px',
                          border: '1.5px solid #e5e7eb', background: '#fff',
                          color: '#6b7280', fontWeight: 700, fontSize: '1rem',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: 0,
                        }}
                      >+</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {total === 0 && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', marginBottom: 0 }}>
                Add at least one question.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 16px', background: 'linear-gradient(160deg, #f0ecff 0%, #ede9fe 100%)', borderTop: '1px solid #e0d9f7' }}>
          <button
            type="submit"
            className="generate-btn w-100 fw-bold"
            disabled={!canSubmit}
            style={{
              background: canSubmit ? 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)' : '#e5e7eb',
              color: canSubmit ? '#fff' : '#9ca3af',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '0.95rem',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              animation: canSubmit && !loading ? 'glow-pulse 2.5s ease-in-out infinite' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm" role="status" /> Generating…</>
            ) : (
              <><span style={{ fontSize: '1.1rem' }}>✨</span> Generate Paper</>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
