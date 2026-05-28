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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f5f3ff 0%, #eff6ff 35%, #fdf4ff 70%, #f0f9ff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', position: 'relative', overflow: 'hidden' }}>

      {/* Decorative background shapes */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Large blurred orbs */}
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '8%', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.09) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '20%', left: '6%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '60%', left: '30%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />

        {/* Dot grid */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.45 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#a5b4fc" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Floating geometric accents */}
        <div style={{ position: 'absolute', top: '12%', right: '14%', width: '20px', height: '20px', borderRadius: '5px', background: 'rgba(139,92,246,0.2)', transform: 'rotate(20deg)', boxShadow: '0 2px 8px rgba(139,92,246,0.15)' }} />
        <div style={{ position: 'absolute', top: '70%', left: '10%', width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(99,102,241,0.25)', boxShadow: '0 2px 6px rgba(99,102,241,0.2)' }} />
        <div style={{ position: 'absolute', top: '35%', left: '5%', width: '24px', height: '24px', borderRadius: '7px', background: 'rgba(168,85,247,0.15)', transform: 'rotate(-15deg)', boxShadow: '0 2px 8px rgba(168,85,247,0.12)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '12%', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(236,72,153,0.18)', boxShadow: '0 2px 6px rgba(236,72,153,0.15)' }} />
        <div style={{ position: 'absolute', bottom: '35%', left: '18%', width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(99,102,241,0.16)', transform: 'rotate(35deg)' }} />
        <div style={{ position: 'absolute', top: '8%', left: '40%', width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(139,92,246,0.18)' }} />
        <div style={{ position: 'absolute', bottom: '12%', left: '45%', width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(59,130,246,0.2)', transform: 'rotate(45deg)' }} />
        <div style={{ position: 'absolute', top: '55%', right: '5%', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(168,85,247,0.14)', boxShadow: '0 2px 6px rgba(168,85,247,0.1)' }} />
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '48px', position: 'relative', zIndex: 1 }}>
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
      <div
        style={{
          width: '100%', maxWidth: '560px',
          background: '#fff',
          borderRadius: '24px',
          border: hovering || dragging
            ? '1px solid rgba(139,92,246,0.2)'
            : '1px solid rgba(196,181,253,0.25)',
          boxShadow: hovering || dragging
            ? '0 0 0 4px rgba(139,92,246,0.06), 0 12px 24px -4px rgba(0,0,0,0.10), 0 40px 80px -12px rgba(99,102,241,0.30)'
            : '0 2px 4px -1px rgba(0,0,0,0.04), 0 8px 16px -4px rgba(0,0,0,0.06), 0 28px 60px -10px rgba(99,102,241,0.18)',
          padding: '40px 36px',
          transform: hovering || dragging ? 'translateY(-6px) scale(1.005)' : 'translateY(0) scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease',
          position: 'relative',
          zIndex: 1,
        }}
      >
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
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '40px', position: 'relative', zIndex: 1 }}>
        {[
          { icon: '⚡', text: 'Instant generation' },
          { icon: '✏️', text: 'Inline editing' },
          { icon: '📄', text: 'PDF export' },
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
