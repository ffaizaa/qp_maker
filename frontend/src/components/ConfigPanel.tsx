import { useState } from 'react';
import type { Difficulty, PaperConfig, QuestionCounts, QuestionType } from '../types';

const QUESTION_TYPES: QuestionType[] = ['MCQ', 'Short Question', 'Broad Question', 'True/False', 'Math Problem'];
const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const DIFFICULTY_STYLES: Record<Difficulty, { active: string; glow: string; hover: string }> = {
  Easy:   { active: 'linear-gradient(135deg, #22c55e, #16a34a)', glow: 'rgba(34,197,94,0.35)',  hover: 'rgba(34,197,94,0.08)'  },
  Medium: { active: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245,158,11,0.35)', hover: 'rgba(245,158,11,0.08)' },
  Hard:   { active: 'linear-gradient(135deg, #ef4444, #dc2626)', glow: 'rgba(239,68,68,0.35)',  hover: 'rgba(239,68,68,0.08)'  },
};

interface Props {
  onGenerate: (config: PaperConfig) => void;
  loading: boolean;
}

export default function ConfigPanel({ onGenerate, loading }: Props) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [counts, setCounts] = useState<QuestionCounts>({ MCQ: 5 });
  const [hoveredDiff, setHoveredDiff] = useState<Difficulty | null>(null);
  const [hoveredCounter, setHoveredCounter] = useState<string | null>(null);
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
        @keyframes header-shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes btn-shimmer {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(250%) skewX(-15deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 4px 18px rgba(99,102,241,0.4); }
          50%       { box-shadow: 0 4px 32px rgba(168,85,247,0.65); }
        }
        .generate-btn { position: relative; overflow: hidden; }
        .generate-btn::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
          transform: translateX(-100%) skewX(-15deg);
        }
        .generate-btn:not(:disabled):hover::after {
          animation: btn-shimmer 0.65s ease forwards;
        }
        .generate-btn:hover:not(:disabled) {
          transform: scale(1.025) !important;
          box-shadow: 0 8px 28px rgba(99,102,241,0.55) !important;
        }
        .generate-btn:active:not(:disabled) {
          transform: scale(0.975) !important;
        }
        .generate-btn { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease !important; }
        .diff-btn { transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1) !important; }
        .diff-btn:hover { transform: translateY(-2px); }
        .diff-btn:active { transform: scale(0.95) !important; }
        .counter-btn { transition: all 0.15s ease !important; }
        .counter-btn:hover:not(:disabled) {
          background: #6366f1 !important;
          color: #fff !important;
          border-color: #6366f1 !important;
          transform: scale(1.18) !important;
          box-shadow: 0 3px 10px rgba(99,102,241,0.35) !important;
        }
        .counter-btn:active:not(:disabled) { transform: scale(0.9) !important; }
        .title-input:focus {
          border-color: #a78bfa !important;
          box-shadow: 0 0 0 3px rgba(139,92,246,0.15) !important;
          outline: none !important;
        }
        .title-input { transition: border-color 0.2s ease, box-shadow 0.2s ease !important; }
      `}</style>

      <form
        onSubmit={handleSubmit}
        className="h-100"
        style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04), 0 12px 40px -8px rgba(99,102,241,0.18), 0 2px 8px rgba(0,0,0,0.05)' }}
      >
        {/* Animated gradient header */}
        <div style={{
          background: 'linear-gradient(270deg, #6366f1, #8b5cf6, #a855f7, #6366f1)',
          backgroundSize: '300% 300%',
          animation: 'header-shimmer 6s ease infinite',
          padding: '18px 20px',
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
              className="title-input form-control"
              style={{ borderRadius: '10px', fontSize: '0.9rem', border: '1.5px solid #e5e7eb', background: '#fff' }}
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
                const { active, glow, hover } = DIFFICULTY_STYLES[d];
                const isSelected = difficulty === d;
                const isHovered = hoveredDiff === d && !isSelected;
                return (
                  <button
                    key={d}
                    type="button"
                    className="diff-btn"
                    onClick={() => setDifficulty(d)}
                    onMouseEnter={() => setHoveredDiff(d)}
                    onMouseLeave={() => setHoveredDiff(null)}
                    style={{
                      flex: 1,
                      padding: '11px 4px',
                      borderRadius: '12px',
                      border: isSelected ? 'none' : `1.5px solid ${isHovered ? 'rgba(0,0,0,0.12)' : '#e5e7eb'}`,
                      background: isSelected ? active : isHovered ? hover : '#fff',
                      color: isSelected ? '#fff' : isHovered ? '#374151' : '#6b7280',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: isSelected
                        ? `0 6px 18px ${glow}`
                        : isHovered ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                    }}
                  >
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
                background: 'linear-gradient(135deg, #ede9fe, #dbeafe)',
                borderRadius: '999px', padding: '2px 10px',
              }}>{total} total</span>
            </div>
            <div className="d-flex flex-column gap-2">
              {QUESTION_TYPES.map((type) => {
                const count = counts[type] ?? 0;
                return (
                  <div key={type} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: count > 0 ? 'rgba(99,102,241,0.06)' : 'transparent',
                    borderRadius: '10px', padding: '5px 8px',
                    border: count > 0 ? '1px solid rgba(99,102,241,0.12)' : '1px solid transparent',
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                  }}>
                    <span style={{
                      flexGrow: 1, fontSize: '0.82rem',
                      color: count > 0 ? '#4f46e5' : '#6b7280',
                      fontWeight: count > 0 ? 600 : 400,
                      transition: 'color 0.2s ease, font-weight 0.2s ease',
                    }}>
                      {type}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <button
                        type="button"
                        className="counter-btn"
                        disabled={count === 0}
                        onClick={() => setCount(type, String(count - 1))}
                        onMouseEnter={() => setHoveredCounter(`${type}-dec`)}
                        onMouseLeave={() => setHoveredCounter(null)}
                        style={{
                          width: '28px', height: '28px', borderRadius: '8px',
                          border: `1.5px solid ${hoveredCounter === `${type}-dec` && count > 0 ? '#6366f1' : '#e5e7eb'}`,
                          background: hoveredCounter === `${type}-dec` && count > 0 ? '#6366f1' : '#fff',
                          color: hoveredCounter === `${type}-dec` && count > 0 ? '#fff' : '#6b7280',
                          fontWeight: 700, fontSize: '1rem',
                          cursor: count === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: count === 0 ? 0.32 : 1,
                          padding: 0,
                        }}
                      >−</button>
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        style={{ width: '3rem', borderRadius: '8px', fontSize: '0.85rem', border: '1.5px solid #e5e7eb', fontWeight: 600 }}
                        min={0}
                        value={count}
                        onChange={(e) => setCount(type, e.target.value)}
                      />
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => setCount(type, String(count + 1))}
                        onMouseEnter={() => setHoveredCounter(`${type}-inc`)}
                        onMouseLeave={() => setHoveredCounter(null)}
                        style={{
                          width: '28px', height: '28px', borderRadius: '8px',
                          border: `1.5px solid ${hoveredCounter === `${type}-inc` ? '#6366f1' : '#e5e7eb'}`,
                          background: hoveredCounter === `${type}-inc` ? '#6366f1' : '#fff',
                          color: hoveredCounter === `${type}-inc` ? '#fff' : '#6b7280',
                          fontWeight: 700, fontSize: '1rem',
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
              background: canSubmit
                ? 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)'
                : 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 100%)',
              color: canSubmit ? '#fff' : '#9ca3af',
              border: 'none',
              borderRadius: '12px',
              padding: '13px',
              fontSize: '0.95rem',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              animation: canSubmit && !loading ? 'glow-pulse 2.5s ease-in-out infinite' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.2px',
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
