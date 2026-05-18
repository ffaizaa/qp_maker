import { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import DocumentPreview from './components/DocumentPreview';
import ConfigPanel from './components/ConfigPanel';
import QuestionPaperView from './components/QuestionPaperView';
import { classifyDocument, generatePaper } from './services/api';
import type { PaperConfig, QuestionPaper } from './types';

type Stage = 'upload' | 'classifying' | 'rejected' | 'configure' | 'generating' | 'done';

function App() {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>('upload');
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string | null>(null);

  async function handleUpload(text: string, uploadedFile: File) {
    setExtractedText(text);
    setFile(uploadedFile);
    setPaper(null);
    setError(null);
    setRejectReason(null);
    setStage('classifying');

    try {
      const result = await classifyDocument(text);
      if (result.academic) {
        setStage('configure');
      } else {
        setRejectReason(result.reason ?? null);
        setStage('rejected');
      }
    } catch {
      // Fail closed — a network/parse error must not silently bypass validation
      setRejectReason('Document validation could not be completed. Please try again.');
      setStage('rejected');
    }
  }

  function handleReplace() {
    setExtractedText(null);
    setFile(null);
    setStage('upload');
    setPaper(null);
    setError(null);
    setRejectReason(null);
  }

  async function handleGenerate(config: PaperConfig) {
    if (!extractedText) return;
    setStage('generating');
    setError(null);
    try {
      const result = await generatePaper(extractedText, config);
      setPaper(result);
      setStage('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed.');
      setStage('configure');
    }
  }

  function handleReset() {
    setPaper(null);
    setStage('configure');
    setError(null);
  }

  // Upload screen
  if (stage === 'upload') {
    return <DocumentUpload onUpload={handleUpload} />;
  }

  // Classifying screen — shown briefly while AI checks the document
  if (stage === 'classifying') {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{
          width: '56px', height: '56px',
          border: '3px solid #e5e7eb', borderTopColor: '#6366f1',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontWeight: 600, color: '#374151', margin: 0 }}>Analysing document…</p>
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Checking if this is an academic document</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Rejected screen
  if (stage === 'rejected') {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{
          maxWidth: '480px', width: '100%', textAlign: 'center',
          background: '#fff',
          border: '1.5px solid #fecaca',
          borderRadius: '20px',
          padding: '48px 36px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 40px -8px rgba(239,68,68,0.1)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📄</div>
          <h2 style={{
            fontSize: '1.3rem', fontWeight: 800, color: '#991b1b',
            margin: '0 0 12px',
          }}>
            Not an Academic Document
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 8px' }}>
            This document does not appear to be an academic document in History, Geography, Science, Mathematics or English. Please upload a relevant study material.
          </p>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center',
            margin: '12px 0 0',
          }}>
            {['History', 'Geography', 'Science', 'Mathematics', 'English'].map((s) => (
              <span key={s} style={{
                background: '#fef2f2', color: '#ef4444',
                border: '1px solid #fecaca',
                borderRadius: '999px', padding: '3px 12px',
                fontSize: '12px', fontWeight: 600,
              }}>{s}</span>
            ))}
          </div>
          {rejectReason && (
            <p style={{
              fontSize: '13px', color: '#ef4444',
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', padding: '8px 14px',
              margin: '12px 0 0',
            }}>
              {rejectReason}
            </p>
          )}
          <button
            onClick={handleReplace}
            style={{
              marginTop: '28px',
              background: 'linear-gradient(90deg, #f97316, #ef4444)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 32px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            Try Another Document
          </button>
        </div>
      </div>
    );
  }

  // Main app
  return (
    <div className="container-fluid py-4 px-4">
      <div className="text-center mb-4 py-3">
        <h1
          className="mb-1 fw-bold"
          style={{
            background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '2.4rem',
            letterSpacing: '-0.5px',
          }}
        >
          Question Generator
        </h1>
        <p className="text-muted small mb-0">Upload a document and generate a question paper instantly</p>
      </div>

      {stage === 'done' && paper ? (
        <div className="row justify-content-center">
          <div className="col-xl-9">
            <div className="card">
              <div className="card-body p-4">
                <QuestionPaperView paper={paper} onReset={handleReset} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row g-4 align-items-start">
          <div className="col-lg-8">
            <DocumentPreview file={file!} text={extractedText!} onReplace={handleReplace} />
          </div>
          <div className="col-lg-4">
            {error && (
              <div className="alert alert-danger mb-3" role="alert">{error}</div>
            )}
            <ConfigPanel onGenerate={handleGenerate} loading={stage === 'generating'} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
