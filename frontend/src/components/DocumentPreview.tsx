import { useEffect, useMemo, useState } from 'react';
import mammoth from 'mammoth';

interface Props {
  file: File;
  text: string;
  onReplace: () => void;
}

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export default function DocumentPreview({ file, text, onReplace }: Props) {
  const [visible, setVisible] = useState(false);
  const [replaceHover, setReplaceHover] = useState(false);

  // Trigger fade-in on mount / file change
  useEffect(() => {
    setVisible(false);
    const t = requestAnimationFrame(() => { requestAnimationFrame(() => setVisible(true)); });
    return () => cancelAnimationFrame(t);
  }, [file]);

  // Blob URL for PDF / image — created once per file, revoked on cleanup
  const blobUrl = useMemo(() => {
    if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  // DOCX → HTML via mammoth
  const [docxHtml, setDocxHtml] = useState<string | null>(null);

  useEffect(() => {
    if (file.type !== DOCX_MIME) return;
    let cancelled = false;
    file.arrayBuffer()
      .then((buf) => mammoth.convertToHtml({ arrayBuffer: buf }))
      .then((result) => { if (!cancelled) setDocxHtml(result.value); });
    return () => { cancelled = true; setDocxHtml(null); };
  }, [file]);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  // Detect file type label
  const ext = file.name.split('.').pop()?.toUpperCase() ?? 'FILE';

  function renderBody() {
    if (file.type === 'application/pdf') {
      return (
        <iframe
          src={blobUrl!}
          title={file.name}
          style={{ width: '100%', height: '70vh', border: 'none', display: 'block' }}
        />
      );
    }

    if (file.type.startsWith('image/')) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', background: '#fafafa' }}>
          <img
            src={blobUrl!}
            alt={file.name}
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
          />
        </div>
      );
    }

    if (file.type === DOCX_MIME) {
      if (!docxHtml) {
        return (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            Rendering document…
          </div>
        );
      }
      return (
        <div
          style={{ padding: '24px 28px', maxHeight: '70vh', overflowY: 'auto', fontFamily: 'Georgia, serif', lineHeight: '1.75', fontSize: '0.95rem', color: '#1f2937' }}
          dangerouslySetInnerHTML={{ __html: docxHtml }}
        />
      );
    }

    // Plain text (TXT)
    return (
      <pre
        style={{
          margin: 0,
          padding: '24px 28px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'inherit',
          fontSize: '0.9rem',
          lineHeight: '1.7',
          maxHeight: '70vh',
          overflowY: 'auto',
          color: '#1f2937',
          background: 'transparent',
        }}
      >
        {text}
      </pre>
    );
  }

  return (
    <>
      <style>{`
        @keyframes preview-fadein {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .preview-scroll::-webkit-scrollbar { width: 6px; }
        .preview-scroll::-webkit-scrollbar-track { background: transparent; }
        .preview-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 999px; }
        .preview-scroll::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.45); }
      `}</style>

      <div style={{
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid rgba(139,92,246,0.18)',
        boxShadow: '0 2px 4px -1px rgba(0,0,0,0.04), 0 10px 32px -6px rgba(99,102,241,0.14), 0 2px 8px rgba(0,0,0,0.04)',
        background: '#fff',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)',
          borderBottom: '1px solid rgba(139,92,246,0.14)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          {/* Left: icon + filename */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              flexShrink: 0,
              width: '34px', height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #ede9fe, #dbeafe)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(99,102,241,0.15)',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="#6366f1" viewBox="0 0 16 16">
                <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5M5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1z"/>
                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1"/>
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={file.name}>
                {file.name}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>
                <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', borderRadius: '4px', padding: '1px 6px', fontWeight: 600, fontSize: '10px', marginRight: '6px' }}>{ext}</span>
                {wordCount.toLocaleString()} words · {text.length.toLocaleString()} chars
              </div>
            </div>
          </div>

          {/* Right: Replace button */}
          <button
            onClick={onReplace}
            onMouseEnter={() => setReplaceHover(true)}
            onMouseLeave={() => setReplaceHover(false)}
            style={{
              flexShrink: 0,
              padding: '7px 16px',
              borderRadius: '10px',
              border: '1.5px solid',
              borderColor: replaceHover ? '#a78bfa' : 'rgba(139,92,246,0.3)',
              background: replaceHover
                ? 'linear-gradient(135deg, #ede9fe, #dbeafe)'
                : 'rgba(139,92,246,0.06)',
              color: replaceHover ? '#5b21b6' : '#6366f1',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: replaceHover ? 'scale(1.04)' : 'scale(1)',
              boxShadow: replaceHover ? '0 2px 10px rgba(139,92,246,0.2)' : 'none',
            }}
          >
            Replace
          </button>
        </div>

        {/* Body */}
        <div className="preview-scroll">
          {renderBody()}
        </div>
      </div>
    </>
  );
}
