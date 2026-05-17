import { useRef, useState } from 'react';
import { uploadDocument } from '../services/api';

const ACCEPTED = '.pdf,.docx,.txt,.jpg,.jpeg,.png,.webp';

interface Props {
  onUpload: (text: string, file: File) => void;
}

export default function DocumentUpload({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const text = await uploadDocument(file);
      onUpload(text, file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setLoading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const isActive = dragging || hovering;

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(135deg, #ede9fe, #dbeafe)',
          borderRadius: '999px', padding: '6px 16px', marginBottom: '20px',
          fontSize: '13px', fontWeight: 600, color: '#6366f1',
        }}>
          <span>✦</span> AI-Powered Question Generator
        </div>

        <h1 style={{
          margin: '0 0 16px',
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 800,
          letterSpacing: '-1px',
          lineHeight: 1.1,
          background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Generate Question Papers<br />in Seconds
        </h1>

        <p style={{ fontSize: '1.05rem', color: '#6b7280', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
          Upload any document — typed, scanned, or handwritten — and get a ready-to-use question paper.
        </p>
      </div>

      {/* Upload card */}
      <div style={{
        width: '100%', maxWidth: '560px',
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 40px -8px rgba(99,102,241,0.12)',
        padding: '40px 36px',
      }}>
        {/* Drop zone */}
        <div
          onClick={() => !loading && inputRef.current?.click()}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${dragging ? '#a855f7' : isActive ? '#6366f1' : '#d1d5db'}`,
            borderRadius: '14px',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: loading ? 'default' : 'pointer',
            background: dragging
              ? 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)'
              : isActive
              ? 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)'
              : '#fafafa',
            transition: 'all 0.2s ease',
            boxShadow: isActive ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            style={{ display: 'none' }}
            onChange={onInputChange}
          />

          {loading ? (
            <div>
              <div style={{
                width: '52px', height: '52px', margin: '0 auto 16px',
                border: '3px solid #e5e7eb', borderTopColor: '#6366f1',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>Processing your document…</p>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>This may take a moment for scanned files</p>
            </div>
          ) : (
            <div>
              {/* Upload icon */}
              <div style={{
                width: '64px', height: '64px', margin: '0 auto 20px',
                borderRadius: '16px',
                background: dragging
                  ? 'linear-gradient(135deg, #a855f7, #6366f1)'
                  : isActive
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(135deg, #e0e7ff, #ede9fe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 8px 20px rgba(99,102,241,0.3)' : 'none',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#fff' : '#6366f1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
              </div>

              <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
                {dragging ? 'Drop it here!' : 'Drag & Drop your file here'}
              </p>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 20px' }}>or</p>

              <button
                type="button"
                style={{
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 28px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              >
                Browse File
              </button>
            </div>
          )}
        </div>

        {/* Supported formats */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 10px' }}>
            Supported formats
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            {['PDF', 'DOCX', 'TXT', 'JPG', 'PNG', 'WEBP'].map((fmt) => (
              <span key={fmt} style={{
                background: '#f3f4f6', color: '#6b7280',
                borderRadius: '6px', padding: '2px 10px',
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.3px',
              }}>{fmt}</span>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#c4b5fd', marginTop: '10px' }}>
            ✦ Supports typed, scanned & handwritten documents · Up to 10 MB
          </p>
        </div>

        {error && (
          <div style={{
            marginTop: '20px', padding: '12px 16px',
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '10px', color: '#dc2626', fontSize: '14px',
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Feature pills */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '40px' }}>
        {[
          { icon: '⚡', text: 'Instant generation' },
          { icon: '✏️', text: 'Inline editing' },
          { icon: '📄', text: 'PDF export' },
          { icon: '🔢', text: 'Math problems' },
        ].map(({ icon, text }) => (
          <div key={text} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: '999px', padding: '6px 14px',
            fontSize: '13px', color: '#374151', fontWeight: 500,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <span>{icon}</span> {text}
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
